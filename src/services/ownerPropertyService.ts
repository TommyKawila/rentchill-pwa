import { createAdminClient } from "@/services/supabase/admin";

export type OwnerPropertyOption = {
  id: string;
  name: string;
  slug: string;
};

export async function listOwnerProperties(): Promise<OwnerPropertyOption[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("properties")
    .select("id, name, slug")
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
  }));
}
