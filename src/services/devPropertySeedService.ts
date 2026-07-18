import { randomBytes, randomInt, randomUUID } from "crypto";
import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { getOwnerQuota } from "@/services/ownerQuotaService";
import { createMoveInReadings } from "@/services/meterReadingService";
import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";
import type { ReminderTier } from "@/services/paymentReminderTier";

export type SeedLineMode = "none" | "synthetic";
export type SeedMode = "replace" | "append";
export type SeedStatusMix = "fresh" | "mixed" | "random";

export type SeedPropertyRoomsInput = {
  property_slug: string;
  room_count: number;
  mode?: SeedMode;
  line_mode?: SeedLineMode;
  status_mix?: SeedStatusMix;
  with_meters?: boolean;
};

async function uniqueInviteCode(supabase: ReturnType<typeof createAdminClient>) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = `RC${randomBytes(3).toString("hex").toUpperCase()}`;
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

function randBetween(min: number, max: number) {
  return randomInt(min, max + 1);
}

function randomInvoiceStatus(): "paid" | "pending" | "scanning" | null {
  const roll = Math.random();
  if (roll < 0.2) return null;
  if (roll < 0.32) return "paid";
  if (roll < 0.78) return "pending";
  return "scanning";
}

function randomReminderTier(): ReminderTier | null {
  const roll = Math.random();
  if (roll < 0.35) return null;
  if (roll < 0.5) return "soft";
  if (roll < 0.72) return "firm";
  return "final";
}

function issuedAtForBillingMonth(billingMonth: string, day = 10) {
  const [year, month] = billingMonth.split("-").map(Number);
  const issuedDay = randBetween(1, Math.min(15, day + 5));
  return new Date(Date.UTC(year, month - 1, issuedDay, 9, 0, 0)).toISOString();
}

type CreatedSeedRow = {
  roomId: string;
  tenantId: string;
  roomNumber: string;
  rent: number;
  lineLinked: boolean;
};

async function insertRandomInvoices(
  supabase: ReturnType<typeof createAdminClient>,
  propertyId: string,
  billingMonth: string,
  rows: CreatedSeedRow[],
  waterRate: number,
  electricRate: number,
  waterFlatBaht: number,
  waterBillingMode: "flat" | "meter",
) {
  for (const row of rows) {
    const status = randomInvoiceStatus();
    if (!status) continue;

    const waterPrev = randBetween(900, 1800);
    const waterUnit =
      waterBillingMode === "flat" ? 0 : randBetween(8, 140);
    const waterCurr =
      waterBillingMode === "flat" ? waterPrev : waterPrev + waterUnit;
    const electricPrev = randBetween(4800, 6200);
    const electricUnit = randBetween(35, 420);
    const electricCurr = electricPrev + electricUnit;
    const waterAmount =
      waterBillingMode === "flat"
        ? waterFlatBaht
        : waterUnit * waterRate;
    const electricAmount = electricUnit * electricRate;
    const total = row.rent + waterAmount + electricAmount;
    const nowIso = new Date().toISOString();
    const reminderTier =
      status === "pending" && row.lineLinked ? randomReminderTier() : null;
    const reminderSentAt =
      reminderTier != null
        ? new Date(
            Date.now() - randBetween(1, 12) * 86_400_000,
          ).toISOString()
        : null;

    await supabase.from("invoices").insert({
      property_id: propertyId,
      tenant_id: row.tenantId,
      room_id: row.roomId,
      billing_month: billingMonth,
      water_unit: waterUnit,
      electric_unit: electricUnit,
      water_prev: waterPrev,
      water_curr: waterCurr,
      electric_prev: electricPrev,
      electric_curr: electricCurr,
      water_recorded_at: nowIso,
      electric_recorded_at: nowIso,
      water_rate_locked: waterRate,
      electric_rate_locked: electricRate,
      base_rent_amount: row.rent,
      water_amount: waterAmount,
      electric_amount: electricAmount,
      total_amount: total,
      status,
      issued_at: issuedAtForBillingMonth(billingMonth),
      reminder_tier_sent: reminderTier,
      reminder_sent_at: reminderSentAt,
      ...(status === "scanning"
        ? { slip_image_url: "/brand/logo.png", slip_submitted_at: nowIso }
        : {}),
    });
  }
}

export async function seedPropertyRooms(input: SeedPropertyRoomsInput) {
  assertDevToolsEnabled();

  const propertySlug = input.property_slug.trim();
  const roomCount = Math.max(1, Math.min(100, Math.round(input.room_count)));
  const mode = input.mode ?? "replace";
  const lineMode = input.line_mode ?? "synthetic";
  const statusMix = input.status_mix ?? "fresh";
  const withMeters = input.with_meters ?? true;

  if (!propertySlug) throw new Error("PROPERTY_SLUG_REQUIRED");

  const supabase = createAdminClient();
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select(
      "id, slug, owner_id, water_rate_per_unit, electric_rate_per_unit, water_billing_mode, water_flat_baht",
    )
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property?.owner_id) throw new Error("PROPERTY_NOT_FOUND");

  const propertyId = String(property.id);
  const ownerId = String(property.owner_id);
  const quota = await getOwnerQuota(ownerId);

  if (mode === "replace") {
    await clearPropertyRooms(propertyId);
  }

  const { count: existingCount } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const currentRooms = existingCount ?? 0;
  const allowed = Math.max(0, quota.room_limit - currentRooms);
  const toCreate = Math.min(roomCount, allowed);

  if (toCreate <= 0) {
    throw new Error("ROOM_LIMIT_EXCEEDED");
  }

  const startNum = mode === "replace" ? 101 : 101 + currentRooms;
  const billingMonth = getCurrentBillingMonth();
  const moveInDate = new Date().toISOString().slice(0, 10);
  let syntheticLineCount = 0;
  let vacantCount = 0;
  const createdRoomIds: CreatedSeedRow[] = [];
  const waterRate = Number(property.water_rate_per_unit ?? 10);
  const electricRate = Number(property.electric_rate_per_unit ?? 7);
  const waterFlatBaht = Number(property.water_flat_baht ?? 0);
  const waterBillingMode =
    property.water_billing_mode === "flat" ? "flat" : "meter";

  for (let i = 0; i < toCreate; i++) {
    const roomNumber = String(startNum + i);
    const rent =
      statusMix === "random"
        ? randBetween(25, 85) * 100
        : 3000 + (i % 7) * 500;

    let roomStatus: "occupied" | "available" | "maintenance" = "occupied";
    if (statusMix === "random") {
      const roll = Math.random();
      if (roll < 0.14) roomStatus = "available";
      else if (roll < 0.18) roomStatus = "maintenance";
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        property_id: propertyId,
        room_number: roomNumber,
        base_rent_price: rent,
        status: roomStatus,
      })
      .select("id")
      .single();

    if (roomError || !room) throw roomError ?? new Error("ROOM_CREATE_FAILED");

    if (roomStatus !== "occupied") {
      vacantCount++;
      continue;
    }

    const inviteCode = await uniqueInviteCode(supabase);
    const tenantId = randomUUID().slice(0, 8);
    const useLine =
      lineMode === "synthetic" &&
      (statusMix !== "random" || Math.random() < 0.82);
    const lineUserId = useLine ? `U_DEV_${tenantId}` : null;
    if (lineUserId) syntheticLineCount++;

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        room_id: room.id,
        name: `Tenant ${roomNumber}`,
        title_prefix: null,
        phone_number: `08${String(10000000 + startNum + i).slice(-8)}`,
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

    if (withMeters) {
      const waterBase = randBetween(950, 1600);
      const electricBase = randBetween(4900, 5800);
      await createMoveInReadings({
        propertyId,
        roomId: String(room.id),
        tenantId: String(tenant.id),
        waterReading: waterBase,
        electricReading: electricBase,
      });
    }

    createdRoomIds.push({
      roomId: String(room.id),
      tenantId: String(tenant.id),
      roomNumber,
      rent,
      lineLinked: Boolean(lineUserId),
    });
  }

  if (statusMix === "random") {
    await insertRandomInvoices(
      supabase,
      propertyId,
      billingMonth,
      createdRoomIds,
      waterRate,
      electricRate,
      waterFlatBaht,
      waterBillingMode,
    );
  } else if (statusMix === "mixed") {
    for (let i = 0; i < createdRoomIds.length; i++) {
      const status = pickInvoiceStatus(i);
      if (!status) continue;
      const row = createdRoomIds[i];
      const total = row.rent + 350;
      await supabase.from("invoices").insert({
        property_id: propertyId,
        tenant_id: row.tenantId,
        room_id: row.roomId,
        billing_month: billingMonth,
        water_unit: 5,
        electric_unit: 50,
        base_rent_amount: row.rent,
        water_amount: 50,
        electric_amount: 350,
        total_amount: total,
        status,
        ...(status === "scanning" ? { slip_image_url: "/brand/logo.png" } : {}),
      });
    }
  }

  return {
    property_slug: propertySlug,
    plan_tier: quota.plan_tier as PlanTier,
    rooms_created: toCreate,
    rooms_requested: roomCount,
    rooms_capped: toCreate < roomCount,
    synthetic_line_count: syntheticLineCount,
    vacant_or_maintenance: vacantCount,
    tenants_created: createdRoomIds.length,
    mode,
    status_mix: statusMix,
    with_meters: withMeters,
  };
}
