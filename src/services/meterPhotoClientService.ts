import { createBrowserClient } from "@/services/supabase/client";
import type { MeterPhotoRow } from "@/services/meterPhotoService";

function mapRow(row: Record<string, unknown>): MeterPhotoRow {
  return {
    id: String(row.id),
    utility_type: row.utility_type as MeterPhotoRow["utility_type"],
    billing_month: String(row.billing_month),
    public_url: String(row.public_url),
    uploaded_by: row.uploaded_by as "owner" | "tenant",
    created_at: String(row.created_at),
  };
}

export async function fetchTenantMeterPhotos(input: {
  roomId: string;
  propertyId: string;
  billingMonth: string;
}): Promise<MeterPhotoRow[]> {
  const supabase = createBrowserClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("plan_tier")
    .eq("id", input.propertyId)
    .maybeSingle();

  if (propertyError) throw propertyError;
  if (!property || String(property.plan_tier) !== "pro") return [];

  const { data, error } = await supabase
    .from("room_meter_media")
    .select("id, utility_type, billing_month, public_url, uploaded_by, created_at")
    .eq("room_id", input.roomId)
    .eq("billing_month", input.billingMonth)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}
