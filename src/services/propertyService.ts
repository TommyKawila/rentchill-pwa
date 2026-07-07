import { createServerClient } from "@/services/supabase/server";
import type { Property, Room } from "@/services/types";

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id, name, slug, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAvailableRooms(propertyId: string): Promise<Room[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, property_id, room_number, base_rent_price, status")
    .eq("property_id", propertyId)
    .eq("status", "available")
    .order("room_number");

  if (error) throw error;
  return (data ?? []).map((room) => ({
    ...room,
    base_rent_price: Number(room.base_rent_price),
  }));
}
