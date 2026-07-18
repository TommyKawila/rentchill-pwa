import { assertOwnerPropertyAccess } from "@/services/ownerPropertyService";
import { createAdminClient } from "@/services/supabase/admin";

export type RoomLifecycleResult = {
  room_id: string;
  room_number: string;
};

async function assertOwnerRoom(
  ownerId: string,
  propertySlug: string,
  roomId: string,
) {
  const { id: propertyId } = await assertOwnerPropertyAccess(ownerId, propertySlug);
  const supabase = createAdminClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("id, room_number, status, property_id")
    .eq("id", roomId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!room) throw new Error("ROOM_NOT_FOUND");

  return { supabase, room };
}

async function assertNoBlockingInvoices(
  supabase: ReturnType<typeof createAdminClient>,
  tenantId: string,
) {
  const { data: blocking, error } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .in("status", ["pending", "scanning"]);

  if (error) throw error;
  if (!blocking?.length) return;

  const hasScanning = blocking.some((invoice) => invoice.status === "scanning");
  throw new Error(hasScanning ? "SLIP_REVIEW" : "UNPAID_BILL");
}

export async function moveOutTenant(
  ownerId: string,
  propertySlug: string,
  roomId: string,
): Promise<RoomLifecycleResult> {
  const { supabase, room } = await assertOwnerRoom(ownerId, propertySlug, roomId);

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("room_id", roomId)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (!tenant) throw new Error("TENANT_NOT_FOUND");

  await assertNoBlockingInvoices(supabase, String(tenant.id));

  const { error: deleteTenantError } = await supabase
    .from("tenants")
    .delete()
    .eq("id", tenant.id);

  if (deleteTenantError) throw deleteTenantError;

  const { error: updateRoomError } = await supabase
    .from("rooms")
    .update({ status: "available" })
    .eq("id", roomId);

  if (updateRoomError) throw updateRoomError;

  return {
    room_id: String(room.id),
    room_number: String(room.room_number),
  };
}

export async function deleteVacantRoom(
  ownerId: string,
  propertySlug: string,
  roomId: string,
): Promise<RoomLifecycleResult> {
  const { supabase, room } = await assertOwnerRoom(ownerId, propertySlug, roomId);

  if (room.status === "occupied") throw new Error("ROOM_NOT_VACANT");

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("room_id", roomId)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (tenant) throw new Error("TENANT_STILL_PRESENT");

  const { error: deleteError } = await supabase.from("rooms").delete().eq("id", roomId);
  if (deleteError) throw deleteError;

  return {
    room_id: String(room.id),
    room_number: String(room.room_number),
  };
}

export function roomLifecycleErrorMessageKey(code: string) {
  if (code === "UNPAID_BILL") return "owner.roomLifecycle.blockUnpaid" as const;
  if (code === "SLIP_REVIEW") return "owner.roomLifecycle.blockScanning" as const;
  if (code === "TENANT_NOT_FOUND") return "owner.roomLifecycle.tenantNotFound" as const;
  if (code === "ROOM_NOT_VACANT") return "owner.roomLifecycle.roomNotVacant" as const;
  if (code === "TENANT_STILL_PRESENT") return "owner.roomLifecycle.tenantStillPresent" as const;
  if (code === "ROOM_NOT_FOUND") return "owner.roomLifecycle.roomNotFound" as const;
  return null;
}
