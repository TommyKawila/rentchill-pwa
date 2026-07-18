import {
  allowedDocumentTypes,
  canAccessDocuments,
  canTenantUploadDocuments,
  canUseDocumentVault,
  canUseStarterManualDocs,
  documentCountLimit,
  type DocumentType,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

const DOC_BUCKET = "documents";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export type TenantDocumentRow = {
  id: string;
  doc_type: DocumentType;
  label: string | null;
  public_url: string;
  mime_type: string;
  uploaded_by: "owner" | "tenant";
  created_at: string;
};

function mapRow(row: Record<string, unknown>): TenantDocumentRow {
  return {
    id: String(row.id),
    doc_type: row.doc_type as DocumentType,
    label: row.label ? String(row.label) : null,
    public_url: String(row.public_url),
    mime_type: String(row.mime_type),
    uploaded_by: row.uploaded_by as "owner" | "tenant",
    created_at: String(row.created_at),
  };
}

async function getPropertyContext(propertySlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, plan_tier")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบหอพัก");

  return {
    propertyId: String(data.id),
    planTier: String(data.plan_tier) as PlanTier,
  };
}

async function assertRoomTenant(
  propertyId: string,
  roomId: string,
  tenantId: string,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, room_id, rooms!inner(property_id)")
    .eq("id", tenantId)
    .eq("room_id", roomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบผู้เช่า");

  const roomRaw = data.rooms as { property_id: string } | { property_id: string }[];
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
  if (!room || String(room.property_id) !== propertyId) {
    throw new Error("ไม่พบห้อง");
  }
}

function assertDocTypeAllowed(tier: PlanTier, docType: DocumentType) {
  if (!allowedDocumentTypes(tier).includes(docType)) {
    throw new Error("PLAN_DOC_TYPE");
  }
}

function assertMimeAllowed(mime: string, docType: DocumentType) {
  if (docType === "lease" || docType === "contract_signed") {
    if (mime !== "text/html") return;
    return;
  }
  if (!mime.startsWith("image/") && mime !== "application/pdf") {
    throw new Error("INVALID_MIME");
  }
}

async function countDocuments(tenantId: string) {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("tenant_documents")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  if (error) throw error;
  return count ?? 0;
}

export async function listTenantDocuments(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);
  if (!canAccessDocuments(planTier)) return [];

  await assertRoomTenant(propertyId, input.roomId, input.tenantId);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenant_documents")
    .select(
      "id, doc_type, label, public_url, mime_type, uploaded_by, created_at",
    )
    .eq("tenant_id", input.tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function uploadTenantDocument(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
  docType: DocumentType;
  file: File;
  uploadedBy: "owner" | "tenant";
  label?: string | null;
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);

  if (input.uploadedBy === "owner") {
    if (!canUseDocumentVault(planTier) && !canUseStarterManualDocs(planTier)) {
      throw new Error("PLAN_DOCUMENT_VAULT");
    }
  } else if (!canTenantUploadDocuments(planTier)) {
    throw new Error("PLAN_DOCUMENT_VAULT");
  }

  assertDocTypeAllowed(planTier, input.docType);
  await assertRoomTenant(propertyId, input.roomId, input.tenantId);

  const limit = documentCountLimit(planTier);
  if (limit !== null) {
    const used = await countDocuments(input.tenantId);
    if (used >= limit) throw new Error("DOC_LIMIT");
  }

  if (input.file.size > MAX_FILE_SIZE) throw new Error("FILE_TOO_LARGE");
  assertMimeAllowed(input.file.type, input.docType);

  const extension =
    input.docType === "lease" || input.docType === "contract_signed"
      ? "html"
      : (input.file.name.split(".").pop() ?? "jpg");
  const path = `${input.propertySlug}/${input.roomId}/${input.tenantId}/${input.docType}/${Date.now()}.${extension}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from(DOC_BUCKET)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });

  if (uploadError) throw new Error("อัปโหลดเอกสารไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(DOC_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("tenant_documents")
    .insert({
      property_id: propertyId,
      room_id: input.roomId,
      tenant_id: input.tenantId,
      doc_type: input.docType,
      label: input.label?.trim() || null,
      storage_path: path,
      public_url: publicUrl.publicUrl,
      mime_type: input.file.type || "application/octet-stream",
      uploaded_by: input.uploadedBy,
    })
    .select(
      "id, doc_type, label, public_url, mime_type, uploaded_by, created_at",
    )
    .single();

  if (error || !data) throw error ?? new Error("บันทึกเอกสารไม่สำเร็จ");
  return mapRow(data);
}

export async function deleteTenantDocument(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
  documentId: string;
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);
  if (!canAccessDocuments(planTier)) throw new Error("PLAN_DOCUMENT_VAULT");

  await assertRoomTenant(propertyId, input.roomId, input.tenantId);

  const supabase = createAdminClient();
  const { data: doc, error: readError } = await supabase
    .from("tenant_documents")
    .select("id, storage_path, tenant_id")
    .eq("id", input.documentId)
    .eq("tenant_id", input.tenantId)
    .maybeSingle();

  if (readError) throw readError;
  if (!doc) throw new Error("ไม่พบเอกสาร");

  await supabase.storage.from(DOC_BUCKET).remove([String(doc.storage_path)]);

  const { error } = await supabase
    .from("tenant_documents")
    .delete()
    .eq("id", input.documentId);

  if (error) throw error;
}

export async function storeGeneratedDocument(input: {
  propertySlug: string;
  propertyId: string;
  roomId: string;
  tenantId: string;
  docType: DocumentType;
  html: string;
  label?: string;
  uploadedBy?: "owner" | "tenant";
}) {
  const blob = new Blob([input.html], { type: "text/html" });
  const file = new File([blob], `${input.docType}.html`, { type: "text/html" });
  return uploadTenantDocument({
    propertySlug: input.propertySlug,
    roomId: input.roomId,
    tenantId: input.tenantId,
    docType: input.docType,
    file,
    uploadedBy: input.uploadedBy ?? "owner",
    label: input.label,
  });
}

export async function getTenantDocumentsByTenantId(tenantId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenant_documents")
    .select(
      "id, doc_type, label, public_url, mime_type, uploaded_by, created_at",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}
