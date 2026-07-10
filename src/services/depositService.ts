import { canUseDepositTracker } from "@/services/planLimits";
import { logAudit } from "@/services/auditLogService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type DepositStatus = "held" | "refunded" | "partial_refund" | "forfeited";

export type TenantDepositRow = {
  tenant_id: string;
  amount: number;
  status: DepositStatus;
  note: string | null;
  updated_at: string;
};

function mapRow(row: Record<string, unknown>): TenantDepositRow {
  return {
    tenant_id: String(row.tenant_id),
    amount: Number(row.amount),
    status: row.status as DepositStatus,
    note: row.note ? String(row.note) : null,
    updated_at: String(row.updated_at),
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
    .select("id, room_id")
    .eq("id", tenantId)
    .eq("room_id", roomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("ไม่พบผู้เช่า");

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("property_id")
    .eq("id", roomId)
    .maybeSingle();

  if (roomError) throw roomError;
  if (!room || String(room.property_id) !== propertyId) {
    throw new Error("ไม่พบห้อง");
  }
}

export async function getTenantDeposit(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);
  if (!canUseDepositTracker(planTier)) return null;

  await assertRoomTenant(propertyId, input.roomId, input.tenantId);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenant_deposits")
    .select("tenant_id, amount, status, note, updated_at")
    .eq("tenant_id", input.tenantId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function upsertTenantDeposit(input: {
  propertySlug: string;
  roomId: string;
  tenantId: string;
  amount: number;
  status: DepositStatus;
  note?: string | null;
  ownerId?: string | null;
}) {
  const { propertyId, planTier } = await getPropertyContext(input.propertySlug);
  if (!canUseDepositTracker(planTier)) throw new Error("PLAN_DEPOSIT");

  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("INVALID_AMOUNT");
  }

  await assertRoomTenant(propertyId, input.roomId, input.tenantId);

  const supabase = createAdminClient();
  const payload = {
    tenant_id: input.tenantId,
    property_id: propertyId,
    room_id: input.roomId,
    amount: input.amount,
    status: input.status,
    note: input.note?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("tenant_deposits")
    .upsert(payload, { onConflict: "tenant_id" })
    .select("tenant_id, amount, status, note, updated_at")
    .single();

  if (error || !data) throw error ?? new Error("บันทึกเงินประกันไม่สำเร็จ");

  await logAudit({
    propertyId,
    roomId: input.roomId,
    tenantId: input.tenantId,
    actorType: "owner",
    actorId: input.ownerId ?? null,
    action: "deposit.update",
    detail: {
      amount: input.amount,
      status: input.status,
      note: input.note ?? null,
    },
  });

  return mapRow(data);
}
