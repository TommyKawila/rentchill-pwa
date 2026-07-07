import { createBrowserClient } from "@/services/supabase/client";
import type { Room, Tenant } from "@/services/types";

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, room_id, line_user_id, phone_number, name, move_in_date, pdpa_consented_at")
    .eq("id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTenantByLineUserId(
  lineUserId: string,
): Promise<Tenant | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, room_id, line_user_id, phone_number, name, move_in_date, pdpa_consented_at")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, property_id, room_number, base_rent_price, status")
    .eq("id", roomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    base_rent_price: Number(data.base_rent_price),
  };
}
