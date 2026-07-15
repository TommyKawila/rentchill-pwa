import { createAdminClient } from "@/services/supabase/admin";

export type AuditActorType = "owner" | "tenant" | "system";

export type AuditLogRow = {
  id: string;
  action: string;
  actor_type: AuditActorType;
  actor_id: string | null;
  room_id: string | null;
  room_number: string | null;
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
    room_number: null,
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
  const rows = (data ?? []).map(mapRow);
  return enrichAuditEntriesWithRooms(rows);
}

export async function enrichAuditEntriesWithRooms(
  entries: AuditLogRow[],
): Promise<AuditLogRow[]> {
  const roomIds = [
    ...new Set(entries.map((e) => e.room_id).filter((id): id is string => Boolean(id))),
  ];
  if (roomIds.length === 0) return entries;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, room_number")
    .in("id", roomIds);

  if (error) throw error;

  const roomNumbers = new Map(
    (data ?? []).map((row) => [String(row.id), String(row.room_number)]),
  );

  return entries.map((entry) => ({
    ...entry,
    room_number: entry.room_id ? (roomNumbers.get(entry.room_id) ?? null) : null,
  }));
}

const DRAFT_ACTION = "meter.draft";

export function filterAuditEntriesForDisplay(
  entries: AuditLogRow[],
  includeAllDrafts: boolean,
): AuditLogRow[] {
  if (includeAllDrafts) return entries;
  return entries.filter((entry) => entry.action !== DRAFT_ACTION);
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

export async function getInvoiceApproveContext(invoiceId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("property_id, room_id, tenant_id, status, slip_image_url")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    propertyId: String(data.property_id),
    roomId: String(data.room_id),
    tenantId: String(data.tenant_id),
    status: String(data.status),
    slip_image_url: data.slip_image_url ? String(data.slip_image_url) : null,
  };
}

export async function getInvoiceAuditContext(invoiceId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("property_id, room_id, tenant_id, billing_month, total_amount")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    propertyId: String(data.property_id),
    roomId: String(data.room_id),
    tenantId: String(data.tenant_id),
    billingMonth: String(data.billing_month),
    totalAmount: Number(data.total_amount),
  };
}

export async function auditInvoiceIssue(input: {
  propertyId: string;
  roomId: string;
  tenantId: string;
  ownerId: string;
  billingMonth: string;
  totalAmount: number;
  waterUnit?: number;
  electricUnit?: number;
}) {
  await logAudit({
    propertyId: input.propertyId,
    roomId: input.roomId,
    tenantId: input.tenantId,
    actorType: "owner",
    actorId: input.ownerId,
    action: "invoice.issue",
    detail: {
      billing_month: input.billingMonth,
      total_amount: input.totalAmount,
      water_unit: input.waterUnit,
      electric_unit: input.electricUnit,
    },
  });
}

export type InvoiceApproveAuditMethod =
  | "manual_cash"
  | "manual_slip"
  | "slip_review_manual"
  | "slip_review_auto";

export async function auditInvoiceApprove(input: {
  invoiceId: string;
  method: InvoiceApproveAuditMethod;
  actorType: AuditActorType;
  actorId?: string | null;
  detail?: Record<string, unknown> | null;
}) {
  const ctx = await getInvoiceAuditContext(input.invoiceId);
  if (!ctx) return;

  await logAudit({
    propertyId: ctx.propertyId,
    roomId: ctx.roomId,
    tenantId: ctx.tenantId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: "invoice.approve",
    detail: {
      invoice_id: input.invoiceId,
      billing_month: ctx.billingMonth,
      total_amount: ctx.totalAmount,
      method: input.method,
      ...input.detail,
    },
  });
}

export async function auditInvoiceReject(input: {
  invoiceId: string;
  actorType: AuditActorType;
  actorId?: string | null;
  note?: string | null;
  source?: string;
}) {
  const ctx = await getInvoiceAuditContext(input.invoiceId);
  if (!ctx) return;

  await logAudit({
    propertyId: ctx.propertyId,
    roomId: ctx.roomId,
    tenantId: ctx.tenantId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: "invoice.reject",
    detail: {
      invoice_id: input.invoiceId,
      note: input.note ?? null,
      source: input.source ?? null,
      billing_month: ctx.billingMonth,
    },
  });
}

export async function auditInvoiceRemind(input: {
  propertyId: string;
  roomId: string;
  tenantId: string;
  ownerId: string;
  invoiceId: string;
  billingMonth: string;
  totalAmount: number;
  tier: "soft" | "firm" | "final";
}) {
  await logAudit({
    propertyId: input.propertyId,
    roomId: input.roomId,
    tenantId: input.tenantId,
    actorType: "owner",
    actorId: input.ownerId,
    action: "invoice.remind",
    detail: {
      invoice_id: input.invoiceId,
      billing_month: input.billingMonth,
      total_amount: input.totalAmount,
      tier: input.tier,
    },
  });
}
