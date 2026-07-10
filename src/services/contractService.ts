import {
  canGenerateContractPdf,
  canTenantSignContract,
  canUseDocumentVault,
} from "@/services/planLimits";
import {
  getTenantDocumentsByTenantId,
  storeGeneratedDocument,
  uploadTenantDocument,
} from "@/services/documentVaultService";
import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export type LeaseContext = {
  propertyName: string;
  propertySlug: string;
  roomNumber: string;
  baseRent: number;
  tenantName: string;
  tenantPhone: string;
  moveInDate: string;
  receiverName: string | null;
  promptPay: string | null;
  bankAccount: string | null;
};

function formatThaiDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatMoney(amount: number) {
  return amount.toLocaleString("th-TH", { minimumFractionDigits: 0 });
}

export function buildLeaseContractHtml(ctx: LeaseContext, signatureUrl?: string) {
  const today = formatThaiDate(new Date().toISOString().slice(0, 10));
  const moveIn = formatThaiDate(ctx.moveInDate);
  const signatureBlock = signatureUrl
    ? `<p>ลายเซ็นผู้เช่า:</p><img src="${signatureUrl}" alt="signature" style="max-height:80px;border:1px solid #ddd;" />`
    : `<p style="margin-top:48px;">ลายเซ็นผู้เช่า: _________________________</p>`;

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <title>สัญญาเช่า ${ctx.roomNumber} - ${ctx.tenantName}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 32px auto; color: #18181b; line-height: 1.6; }
    h1 { font-size: 1.25rem; margin-bottom: 8px; }
    .muted { color: #71717a; font-size: 0.875rem; }
    section { margin-top: 24px; }
  </style>
</head>
<body>
  <h1>สัญญาเช่าห้องพัก</h1>
  <p class="muted">จัดทำเมื่อ ${today}</p>
  <section>
    <p><strong>ผู้ให้เช่า:</strong> ${ctx.receiverName ?? ctx.propertyName}</p>
    <p><strong>สถานที่:</strong> ${ctx.propertyName}</p>
    <p><strong>ผู้เช่า:</strong> ${ctx.tenantName}</p>
    <p><strong>โทรศัพท์:</strong> ${ctx.tenantPhone}</p>
    <p><strong>ห้อง:</strong> ${ctx.roomNumber}</p>
    <p><strong>วันเริ่มเช่า:</strong> ${moveIn}</p>
    <p><strong>ค่าเช่า:</strong> ฿${formatMoney(ctx.baseRent)} / เดือน</p>
  </section>
  <section>
    <p>ผู้เช่าตกลงชำระค่าเช่าภายในวันที่กำหนดในใบแจ้งหนี้รายเดือนผ่านช่องทางที่ผู้ให้เช่ากำหนด</p>
    ${ctx.promptPay ? `<p>พร้อมเพย์: ${ctx.promptPay}</p>` : ""}
    ${ctx.bankAccount ? `<p>บัญชีธนาคาร: ${ctx.bankAccount}</p>` : ""}
    <p>ผู้เช่ารับทราบเงื่อนไขการใช้ห้องพักและการชำระค่าน้ำค่าไฟตามที่ผู้ให้เช่าแจ้งในแต่ละรอบบิล</p>
  </section>
  <section>
    <p style="margin-top:48px;">ลายเซ็นผู้ให้เช่า: _________________________</p>
    ${signatureBlock}
  </section>
</body>
</html>`;
}

async function getLeaseContext(
  propertySlug: string,
  roomId: string,
  tenantId: string,
): Promise<LeaseContext & { propertyId: string; planTier: PlanTier }> {
  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select(
      "id, name, slug, plan_tier, payment_prompt_pay, payment_bank_account, payment_receiver_name",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, phone_number, move_in_date, room_id, rooms!inner(id, room_number, base_rent_price, property_id)")
    .eq("id", tenantId)
    .eq("room_id", roomId)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (!tenant) throw new Error("ไม่พบผู้เช่า");

  const roomRaw = tenant.rooms as
    | { id: string; room_number: string; base_rent_price: number; property_id: string }
    | { id: string; room_number: string; base_rent_price: number; property_id: string }[];
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
  if (!room || String(room.property_id) !== String(property.id)) {
    throw new Error("ไม่พบห้อง");
  }

  return {
    propertyId: String(property.id),
    planTier: String(property.plan_tier) as PlanTier,
    propertyName: String(property.name),
    propertySlug: String(property.slug),
    roomNumber: String(room.room_number),
    baseRent: Number(room.base_rent_price),
    tenantName: String(tenant.name),
    tenantPhone: String(tenant.phone_number),
    moveInDate: String(tenant.move_in_date),
    receiverName: property.payment_receiver_name
      ? String(property.payment_receiver_name)
      : null,
    promptPay: property.payment_prompt_pay
      ? String(property.payment_prompt_pay)
      : null,
    bankAccount: property.payment_bank_account
      ? String(property.payment_bank_account)
      : null,
  };
}

export async function generateLeaseContract(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
}) {
  const ctx = await getLeaseContext(
    input.propertySlug,
    input.roomId,
    input.tenantId,
  );

  if (!canGenerateContractPdf(ctx.planTier)) {
    throw new Error("PLAN_CONTRACT");
  }

  const html = buildLeaseContractHtml(ctx);
  const doc = await storeGeneratedDocument({
    propertySlug: ctx.propertySlug,
    propertyId: ctx.propertyId,
    roomId: input.roomId,
    tenantId: input.tenantId,
    docType: "lease",
    html,
    label: `สัญญาเช่า ${ctx.roomNumber}`,
  });

  return { html, document: doc };
}

export async function signLeaseContract(input: {
  tenantId: string;
  signatureFile: File;
}) {
  const supabase = createAdminClient();
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, room_id")
    .eq("id", input.tenantId)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (!tenant) throw new Error("ไม่พบผู้เช่า");

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("property_id")
    .eq("id", tenant.room_id)
    .maybeSingle();

  if (roomError) throw roomError;
  if (!room) throw new Error("ไม่พบห้อง");

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("slug, plan_tier")
    .eq("id", room.property_id)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const planTier = String(property.plan_tier) as PlanTier;
  if (!canTenantSignContract(planTier)) throw new Error("PLAN_ESIGN");

  const docs = await getTenantDocumentsByTenantId(input.tenantId);
  const hasSigned = docs.some((doc) => doc.doc_type === "contract_signed");
  if (hasSigned) throw new Error("ALREADY_SIGNED");

  const leaseDoc = docs.find((doc) => doc.doc_type === "lease");
  if (!leaseDoc) throw new Error("NO_LEASE");

  const ctx = await getLeaseContext(
    property.slug,
    String(tenant.room_id),
    input.tenantId,
  );

  const signaturePath = `${property.slug}/${tenant.room_id}/${input.tenantId}/signatures/${Date.now()}.png`;
  const { error: sigUploadError } = await supabase.storage
    .from("documents")
    .upload(signaturePath, input.signatureFile, {
      contentType: input.signatureFile.type,
      upsert: false,
    });
  if (sigUploadError) throw new Error("อัปโหลดลายเซ็นไม่สำเร็จ");

  const { data: sigUrl } = supabase.storage
    .from("documents")
    .getPublicUrl(signaturePath);

  const signedHtml = buildLeaseContractHtml(ctx, sigUrl.publicUrl);
  const signedDoc = await storeGeneratedDocument({
    propertySlug: property.slug,
    propertyId: ctx.propertyId,
    roomId: String(tenant.room_id),
    tenantId: input.tenantId,
    docType: "contract_signed",
    html: signedHtml,
    label: `สัญญาเซ็นแล้ว ${ctx.roomNumber}`,
    uploadedBy: "tenant",
  });

  return { document: signedDoc, signature_url: sigUrl.publicUrl };
}

export async function getLeaseContractHtml(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
}) {
  const ctx = await getLeaseContext(
    input.propertySlug,
    input.roomId,
    input.tenantId,
  );
  if (!canUseDocumentVault(ctx.planTier)) throw new Error("PLAN_DOCUMENT_VAULT");

  const docs = await getTenantDocumentsByTenantId(input.tenantId);
  const lease = docs.find((doc) => doc.doc_type === "lease");
  if (lease) {
    const response = await fetch(lease.public_url);
    const html = await response.text();
    return { html, document: lease };
  }

  if (!canGenerateContractPdf(ctx.planTier)) throw new Error("PLAN_CONTRACT");
  const html = buildLeaseContractHtml(ctx);
  return { html, document: null };
}
