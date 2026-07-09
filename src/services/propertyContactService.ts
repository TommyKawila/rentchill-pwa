import { createBrowserClient } from "@/services/supabase/client";
import type { PropertyContact } from "@/services/types";

export async function getPropertyContactById(
  propertyId: string,
): Promise<PropertyContact | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("properties")
    .select("contact_line_url, contact_line_qr_url, contact_phone")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    contact_line_url: data.contact_line_url ? String(data.contact_line_url) : null,
    contact_line_qr_url: data.contact_line_qr_url ? String(data.contact_line_qr_url) : null,
    contact_phone: data.contact_phone ? String(data.contact_phone) : null,
  };
}
