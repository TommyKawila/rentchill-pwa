import { randomBytes, randomUUID } from "crypto";
import { assertDevToolsEnabled } from "@/services/devToolsGuard";
import { getCurrentBillingMonth } from "@/services/invoiceCalculator";
import { getOwnerQuota } from "@/services/ownerQuotaService";
import { createMoveInReadings } from "@/services/meterReadingService";
import { createAdminClient } from "@/services/supabase/admin";
import type { PlanTier } from "@/services/propertyQuotaService";

export type SeedLineMode = "none" | "synthetic";
export type SeedMode = "replace" | "append";
export type SeedStatusMix = "fresh" | "mixed";

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
    .select("id, slug, owner_id")
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
  const createdRoomIds: Array<{
    roomId: string;
    tenantId: string;
    roomNumber: string;
    rent: number;
  }> = [];

  for (let i = 0; i < toCreate; i++) {
    const roomNumber = String(startNum + i);
    const rent = 3000 + (i % 7) * 500;
    const inviteCode = await uniqueInviteCode(supabase);

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
    const lineUserId =
      lineMode === "synthetic" ? `U_DEV_${tenantId}` : null;
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
      const waterBase = 1000 + i * 10;
      const electricBase = 5000 + i * 15;
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
    });
  }

  if (statusMix === "mixed") {
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
    mode,
    status_mix: statusMix,
    with_meters: withMeters,
  };
}
