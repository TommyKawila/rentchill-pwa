import { randomBytes, randomUUID } from "crypto";
import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { createMoveInReadings } from "@/services/meterReadingService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";
import {
  getNextTrialResetAt,
  getTrialOwnerId,
  getTrialPropertySlug,
  getTrialTenantInviteCode,
} from "@/services/trialSandboxService";

const ROOM_COUNT = 20;

async function uniqueInviteCode(
  supabase: ReturnType<typeof createAdminClient>,
  reserved: string,
) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `RC${randomBytes(3).toString("hex").toUpperCase()}`;
    if (code === reserved) continue;
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (error) throw error;
    if (!data) return code;
  }
  throw new Error("INVITE_CODE_FAILED");
}

async function clearPropertyRooms(propertyId: string) {
  const supabase = createAdminClient();

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id")
    .eq("property_id", propertyId);

  if (roomsError) throw roomsError;
  const roomIds = (rooms ?? []).map((r) => String(r.id));
  if (roomIds.length === 0) return;

  await supabase.from("tenant_documents").delete().eq("property_id", propertyId);
  await supabase.from("invoices").delete().eq("property_id", propertyId);
  await supabase.from("meter_readings").delete().eq("property_id", propertyId);

  const { error: tenantsError } = await supabase
    .from("tenants")
    .delete()
    .in("room_id", roomIds);
  if (tenantsError) throw tenantsError;

  const { error: deleteRoomsError } = await supabase
    .from("rooms")
    .delete()
    .eq("property_id", propertyId);
  if (deleteRoomsError) throw deleteRoomsError;
}

function pickInvoiceStatus(index: number): "paid" | "pending" | "scanning" | null {
  const bucket = index % 10;
  if (bucket < 2) return "paid";
  if (bucket < 5) return "pending";
  if (bucket < 6) return "scanning";
  return null;
}

export async function seedTrialProperty(input?: {
  planTier?: PlanTier;
  force?: boolean;
}) {
  const propertySlug = getTrialPropertySlug();
  const trialInvite = getTrialTenantInviteCode();
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property?.owner_id) throw new Error("TRIAL_PROPERTY_NOT_FOUND");

  const propertyId = String(property.id);
  const ownerId = String(property.owner_id);
  if (ownerId !== getTrialOwnerId()) throw new Error("TRIAL_OWNER_MISMATCH");

  const { count: existingCount } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const hasRooms = (existingCount ?? 0) > 0;
  if (hasRooms && !input?.force) {
    if (input?.planTier) {
      await setTrialPlanTier(input.planTier);
    }
    const { data: owner } = await supabase
      .from("owners")
      .select("plan_tier, trial_reset_at")
      .eq("id", ownerId)
      .maybeSingle();
    const resetAt = owner?.trial_reset_at ? String(owner.trial_reset_at) : null;
    return {
      property_slug: propertySlug,
      plan_tier: (owner?.plan_tier as PlanTier) ?? input?.planTier ?? "premium",
      rooms_created: 0,
      tenant_invite_code: trialInvite,
      reseeded: false,
      reset_at: resetAt,
      reset_expires_at: getNextTrialResetAt(resetAt),
    };
  }

  if (hasRooms) await clearPropertyRooms(propertyId);

  const planTier = input?.planTier ?? "premium";
  const billingMonth = getCurrentBillingMonth();
  const moveInDate = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const { error: ownerUpdateError } = await supabase
    .from("owners")
    .update({
      plan_tier: planTier,
      status: "active",
      trial_reset_at: nowIso,
    })
    .eq("id", ownerId);
  if (ownerUpdateError) throw ownerUpdateError;

  const { error: propertyUpdateError } = await supabase
    .from("properties")
    .update({
      plan_tier: planTier,
      quota_month: billingMonth,
      line_push_used_this_month: 0,
      csv_used_this_month: 0,
      reminder_used_this_month: 0,
      payment_receiver_name: "CHINNAREE RATCHARIT",
    })
    .eq("id", propertyId);
  if (propertyUpdateError) throw propertyUpdateError;

  let syntheticLineCount = 0;
  const createdRoomIds: Array<{
    roomId: string;
    tenantId: string;
    roomNumber: string;
    rent: number;
  }> = [];

  for (let i = 0; i < ROOM_COUNT; i++) {
    const roomNumber = String(101 + i);
    const rent = roomNumber === "101" ? 2000 : 3000 + (i % 7) * 500;
    const inviteCode =
      roomNumber === "101"
        ? trialInvite
        : await uniqueInviteCode(supabase, trialInvite);

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        property_id: propertyId,
        room_number: roomNumber,
        base_rent_price: rent,
        status: "occupied",
      })
      .select("id")
      .single();

    if (roomError || !room) throw roomError ?? new Error("ROOM_CREATE_FAILED");

    const tenantId = randomUUID().slice(0, 8);
    const lineUserId = roomNumber === "102" ? `U_TRIAL_${tenantId}` : null;
    if (lineUserId) syntheticLineCount++;

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        room_id: room.id,
        name: roomNumber === "101" ? "คุณทดลอง" : `Tenant ${roomNumber}`,
        title_prefix: null,
        phone_number: `08${String(10000000 + 101 + i).slice(-8)}`,
        move_in_date: moveInDate,
        invite_code: inviteCode,
        line_user_id: lineUserId,
      })
      .select("id")
      .single();

    if (tenantError || !tenant) {
      await supabase.from("rooms").delete().eq("id", room.id);
      throw tenantError ?? new Error("TENANT_CREATE_FAILED");
    }

    const waterBase = 1000 + i * 10;
    const electricBase = 5000 + i * 15;
    await createMoveInReadings({
      propertyId,
      roomId: String(room.id),
      tenantId: String(tenant.id),
      waterReading: waterBase,
      electricReading: electricBase,
    });

    createdRoomIds.push({
      roomId: String(room.id),
      tenantId: String(tenant.id),
      roomNumber,
      rent,
    });
  }

  for (let i = 0; i < createdRoomIds.length; i++) {
    const status = pickInvoiceStatus(i);
    if (!status) continue;
    const row = createdRoomIds[i];
    const isDemoRoom = row.roomNumber === "101";
    const waterAmount = isDemoRoom ? 0 : 50;
    const electricAmount = isDemoRoom ? 0 : 350;
    const total = row.rent + waterAmount + electricAmount;
    const invoiceStatus = isDemoRoom ? "pending" : status;

    await supabase.from("invoices").insert({
      property_id: propertyId,
      tenant_id: row.tenantId,
      room_id: row.roomId,
      billing_month: billingMonth,
      water_unit: isDemoRoom ? 0 : 5,
      electric_unit: isDemoRoom ? 0 : 50,
      base_rent_amount: row.rent,
      water_amount: waterAmount,
      electric_amount: electricAmount,
      total_amount: total,
      status: invoiceStatus,
      ...(invoiceStatus === "scanning"
        ? { slip_image_url: "/brand/logo.png" }
        : {}),
    });
  }

  return {
    property_slug: propertySlug,
    plan_tier: planTier,
    rooms_created: ROOM_COUNT,
    synthetic_line_count: syntheticLineCount,
    tenant_invite_code: trialInvite,
    reseeded: true,
    reset_at: nowIso,
    reset_expires_at: getNextTrialResetAt(nowIso),
  };
}

export async function setTrialPlanTier(planTier: PlanTier) {
  const ownerId = getTrialOwnerId();
  const propertySlug = getTrialPropertySlug();
  const supabase = createAdminClient();
  const billingMonth = getCurrentBillingMonth();

  const { error: ownerError } = await supabase
    .from("owners")
    .update({ plan_tier: planTier, status: "active" })
    .eq("id", ownerId);
  if (ownerError) throw ownerError;

  const { data: property, error: propertyReadError } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (propertyReadError) throw propertyReadError;
  if (!property) throw new Error("TRIAL_PROPERTY_NOT_FOUND");

  const { error: propertyError } = await supabase
    .from("properties")
    .update({
      plan_tier: planTier,
      quota_month: billingMonth,
      line_push_used_this_month: 0,
      csv_used_this_month: 0,
      reminder_used_this_month: 0,
    })
    .eq("id", property.id);
  if (propertyError) throw propertyError;

  return { plan_tier: planTier, property_slug: propertySlug };
}

export async function getTrialStatus() {
  const ownerId = getTrialOwnerId();
  const propertySlug = getTrialPropertySlug();
  const supabase = createAdminClient();

  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .select("plan_tier, trial_reset_at")
    .eq("id", ownerId)
    .maybeSingle();
  if (ownerError) throw ownerError;
  if (!owner) throw new Error("TRIAL_OWNER_NOT_FOUND");

  const resetAt = owner.trial_reset_at ? String(owner.trial_reset_at) : null;

  return {
    enabled: true,
    plan_tier: String(owner.plan_tier) as PlanTier,
    property_slug: propertySlug,
    tenant_invite_code: getTrialTenantInviteCode(),
    reset_at: resetAt,
    reset_expires_at: getNextTrialResetAt(resetAt),
  };
}
