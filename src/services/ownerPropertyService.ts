import { createAdminClient } from "@/services/supabase/admin";

export type OwnerPropertyOption = {
  id: string;
  name: string;
  slug: string;
};

export async function listOwnerProperties(
  ownerId: string,
): Promise<OwnerPropertyOption[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("properties")
    .select("id, name, slug")
    .eq("owner_id", ownerId)
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
  }));
}

export async function assertOwnerPropertyAccess(
  ownerId: string,
  propertySlug: string,
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("slug", propertySlug)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("FORBIDDEN");
  return { id: String(data.id) };
}

export async function assertOwnerInvoiceAccess(ownerId: string, invoiceId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, properties!inner(owner_id)")
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("FORBIDDEN");

  const propertyRaw = data.properties as { owner_id: string } | { owner_id: string }[];
  const property = Array.isArray(propertyRaw) ? propertyRaw[0] : propertyRaw;
  if (property?.owner_id !== ownerId) throw new Error("FORBIDDEN");
}
