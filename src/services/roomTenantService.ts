import { randomBytes } from "crypto";
import { assertOwnerRoomCapacity } from "@/services/ownerQuotaService";
import { assertOwnerPropertyAccess } from "@/services/ownerPropertyService";
import { createMoveInReadings } from "@/services/meterReadingService";
import { createAdminClient } from "@/services/supabase/admin";
import { buildTenantInviteUrl } from "@/services/tenantLinkService";

export type AddRoomTenantInput = {
  property_slug: string;
  room_number: string;
  base_rent_price: number;
  tenant_name: string;
  phone_number: string;
  move_in_date?: string;
  water_reading?: number;
  electric_reading?: number;
};

export type AddRoomTenantResult = {
  room_id: string;
  tenant_id: string;
  room_number: string;
  tenant_name: string;
  invite_code: string;
  invite_url: string;
};

export type AddVacantRoomResult = {
  room_id: string;
  room_number: string;
};

export type AddVacantRoomInput = {
  property_slug: string;
  room_number: string;
  base_rent_price: number;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function uniqueInviteCode(supabase: ReturnType<typeof createAdminClient>) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `RC${randomBytes(3).toString("hex").toUpperCase()}`;
    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return code;
  }

  throw new Error("สร้างรหัสเชิญไม่สำเร็จ");
}

export async function createRoomWithTenant(
  ownerId: string,
  input: AddRoomTenantInput,
): Promise<AddRoomTenantResult> {
  const roomNumber = input.room_number.trim();
  const tenantName = input.tenant_name.trim();
  const phoneNumber = input.phone_number.trim();

  if (!roomNumber) throw new Error("ROOM_NUMBER_REQUIRED");
  if (!tenantName) throw new Error("TENANT_NAME_REQUIRED");
  if (!phoneNumber) throw new Error("PHONE_REQUIRED");
  if (!Number.isFinite(input.base_rent_price) || input.base_rent_price < 0) {
    throw new Error("INVALID_RENT");
  }

  const moveInDate = input.move_in_date?.trim() || todayIsoDate();
  const waterReading = input.water_reading;
  const electricReading = input.electric_reading;

  if (
    waterReading === undefined ||
    electricReading === undefined ||
    !Number.isFinite(waterReading) ||
    !Number.isFinite(electricReading) ||
    waterReading < 0 ||
    electricReading < 0
  ) {
    throw new Error("METER_BASELINE_REQUIRED");
  }

  const { id: propertyId } = await assertOwnerPropertyAccess(
    ownerId,
    input.property_slug,
  );

  await assertOwnerRoomCapacity(ownerId, {
    propertyId,
    incomingRoomNumbers: [roomNumber],
  });

  const supabase = createAdminClient();
  const inviteCode = await uniqueInviteCode(supabase);

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      property_id: propertyId,
      room_number: roomNumber,
      base_rent_price: input.base_rent_price,
      status: "occupied",
    })
    .select("id, room_number")
    .single();

  if (roomError || !room) {
    if (roomError?.code === "23505") {
      throw new Error("ROOM_NUMBER_EXISTS");
    }
    throw new Error(roomError?.message ?? "สร้างห้องไม่สำเร็จ");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      room_id: room.id,
      name: tenantName,
      title_prefix: null,
      phone_number: phoneNumber,
      move_in_date: moveInDate,
      invite_code: inviteCode,
    })
    .select("id, name, invite_code")
    .single();

  if (tenantError || !tenant) {
    await supabase.from("rooms").delete().eq("id", room.id);
    throw new Error(tenantError?.message ?? "สร้างผู้เช่าไม่สำเร็จ");
  }

  await createMoveInReadings({
    propertyId,
    roomId: String(room.id),
    tenantId: String(tenant.id),
    waterReading,
    electricReading,
  });

  const code = String(tenant.invite_code);

  return {
    room_id: String(room.id),
    tenant_id: String(tenant.id),
    room_number: String(room.room_number),
    tenant_name: String(tenant.name),
    invite_code: code,
    invite_url: buildTenantInviteUrl(code),
  };
}

export type AssignTenantToVacantRoomInput = {
  property_slug: string;
  room_id: string;
  base_rent_price?: number;
  tenant_name: string;
  phone_number: string;
  move_in_date?: string;
  water_reading: number;
  electric_reading: number;
};

export async function assignTenantToVacantRoom(
  ownerId: string,
  input: AssignTenantToVacantRoomInput,
): Promise<AddRoomTenantResult> {
  const tenantName = input.tenant_name.trim();
  const phoneNumber = input.phone_number.trim();

  if (!tenantName) throw new Error("TENANT_NAME_REQUIRED");
  if (!phoneNumber) throw new Error("PHONE_REQUIRED");

  const moveInDate = input.move_in_date?.trim() || todayIsoDate();
  const { water_reading: waterReading, electric_reading: electricReading } = input;

  if (
    !Number.isFinite(waterReading) ||
    !Number.isFinite(electricReading) ||
    waterReading < 0 ||
    electricReading < 0
  ) {
    throw new Error("METER_BASELINE_REQUIRED");
  }

  const { id: propertyId } = await assertOwnerPropertyAccess(
    ownerId,
    input.property_slug,
  );

  const supabase = createAdminClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, room_number, status, base_rent_price")
    .eq("id", input.room_id)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (roomError) throw roomError;
  if (!room) throw new Error("ROOM_NOT_FOUND");
  if (room.status !== "available" && room.status !== "maintenance") {
    throw new Error("ROOM_NOT_VACANT");
  }

  const { data: existingTenant, error: tenantLookupError } = await supabase
    .from("tenants")
    .select("id")
    .eq("room_id", input.room_id)
    .maybeSingle();

  if (tenantLookupError) throw tenantLookupError;
  if (existingTenant) throw new Error("TENANT_STILL_PRESENT");

  const baseRent =
    input.base_rent_price !== undefined
      ? input.base_rent_price
      : Number(room.base_rent_price);

  if (!Number.isFinite(baseRent) || baseRent < 0) {
    throw new Error("INVALID_RENT");
  }

  const inviteCode = await uniqueInviteCode(supabase);

  const { error: updateRoomError } = await supabase
    .from("rooms")
    .update({
      status: "occupied",
      base_rent_price: baseRent,
    })
    .eq("id", input.room_id);

  if (updateRoomError) throw updateRoomError;

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      room_id: input.room_id,
      name: tenantName,
      title_prefix: null,
      phone_number: phoneNumber,
      move_in_date: moveInDate,
      invite_code: inviteCode,
    })
    .select("id, name, invite_code")
    .single();

  if (tenantError || !tenant) {
    await supabase
      .from("rooms")
      .update({
        status: room.status,
        base_rent_price: room.base_rent_price,
      })
      .eq("id", input.room_id);
    throw new Error(tenantError?.message ?? "สร้างผู้เช่าไม่สำเร็จ");
  }

  await createMoveInReadings({
    propertyId,
    roomId: String(room.id),
    tenantId: String(tenant.id),
    waterReading,
    electricReading,
  });

  const code = String(tenant.invite_code);

  return {
    room_id: String(room.id),
    tenant_id: String(tenant.id),
    room_number: String(room.room_number),
    tenant_name: String(tenant.name),
    invite_code: code,
    invite_url: buildTenantInviteUrl(code),
  };
}

export async function createVacantRoom(
  ownerId: string,
  input: AddVacantRoomInput,
): Promise<AddVacantRoomResult> {
  const roomNumber = input.room_number.trim();

  if (!roomNumber) throw new Error("ROOM_NUMBER_REQUIRED");
  if (!Number.isFinite(input.base_rent_price) || input.base_rent_price < 0) {
    throw new Error("INVALID_RENT");
  }

  const { id: propertyId } = await assertOwnerPropertyAccess(
    ownerId,
    input.property_slug,
  );

  await assertOwnerRoomCapacity(ownerId, {
    propertyId,
    incomingRoomNumbers: [roomNumber],
  });

  const supabase = createAdminClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      property_id: propertyId,
      room_number: roomNumber,
      base_rent_price: input.base_rent_price,
      status: "available",
    })
    .select("id, room_number")
    .single();

  if (roomError || !room) {
    if (roomError?.code === "23505") {
      throw new Error("ROOM_NUMBER_EXISTS");
    }
    throw new Error(roomError?.message ?? "สร้างห้องไม่สำเร็จ");
  }

  return {
    room_id: String(room.id),
    room_number: String(room.room_number),
  };
}
