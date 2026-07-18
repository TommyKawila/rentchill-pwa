import { createAdminClient } from "@/services/supabase/admin";
import type { RoomStatus } from "@/services/types";

export type VacantRoomRow = {
  room_id: string;
  room_number: string;
  base_rent_price: number;
  status: RoomStatus;
};

export async function listVacantRooms(propertySlug: string): Promise<VacantRoomRow[]> {
  const supabase = createAdminClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property) throw new Error("ไม่พบหอพัก");

  const { data, error } = await supabase
    .from("rooms")
    .select("id, room_number, base_rent_price, status")
    .eq("property_id", property.id)
    .in("status", ["available", "maintenance"])
    .order("room_number");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    room_id: String(row.id),
    room_number: String(row.room_number),
    base_rent_price: Number(row.base_rent_price),
    status: row.status as RoomStatus,
  }));
}
