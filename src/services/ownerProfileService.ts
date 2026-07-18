import { createAdminClient } from "@/services/supabase/admin";

export type OwnerProfile = {
  id: string;
  name: string;
};

export async function getOwnerProfile(ownerId: string): Promise<OwnerProfile | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("owners")
    .select("id, name")
    .eq("id", ownerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: String(data.id),
    name: String(data.name).trim() || "Owner",
  };
}
