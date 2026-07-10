import { createAdminClient } from "@/services/supabase/admin";

export type AuditActorType = "owner" | "tenant" | "system";

export type AuditLogRow = {
  id: string;
  action: string;
  actor_type: AuditActorType;
  actor_id: string | null;
  room_id: string | null;
  tenant_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
};

function mapRow(row: Record<string, unknown>): AuditLogRow {
  return {
    id: String(row.id),
    action: String(row.action),
    actor_type: row.actor_type as AuditActorType,
    actor_id: row.actor_id ? String(row.actor_id) : null,
    room_id: row.room_id ? String(row.room_id) : null,
    tenant_id: row.tenant_id ? String(row.tenant_id) : null,
    detail: (row.detail as Record<string, unknown> | null) ?? null,
    created_at: String(row.created_at),
  };
}

export async function logAudit(input: {
  propertyId: string;
  roomId?: string | null;
  tenantId?: string | null;
  actorType: AuditActorType;
  actorId?: string | null;
  action: string;
  detail?: Record<string, unknown> | null;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("audit_log").insert({
    property_id: input.propertyId,
    room_id: input.roomId ?? null,
    tenant_id: input.tenantId ?? null,
    actor_type: input.actorType,
    actor_id: input.actorId ?? null,
    action: input.action,
    detail: input.detail ?? null,
  });

  if (error) console.error("[auditLog]", error);
}

export async function listPropertyAuditLog(propertySlug: string, limit = 40) {
  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data, error } = await supabase
    .from("audit_log")
    .select("id, action, actor_type, actor_id, room_id, tenant_id, detail, created_at")
    .eq("property_id", property.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function logAuditForSlug(input: {
  propertySlug: string;
  roomId?: string | null;
  tenantId?: string | null;
  actorType: AuditActorType;
  actorId?: string | null;
  action: string;
  detail?: Record<string, unknown> | null;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", input.propertySlug)
    .maybeSingle();

  if (error || !data) return;

  await logAudit({
    propertyId: String(data.id),
    roomId: input.roomId,
    tenantId: input.tenantId,
    actorType: input.actorType,
    actorId: input.actorId,
    action: input.action,
    detail: input.detail,
  });
}

export async function getInvoiceAuditContext(invoiceId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("property_id, room_id, tenant_id")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    propertyId: String(data.property_id),
    roomId: String(data.room_id),
    tenantId: String(data.tenant_id),
  };
}
