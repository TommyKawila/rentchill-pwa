import { slugFromPropertyName as slugFromName } from "@/services/propertySlugUtils";
import { createAdminClient } from "@/services/supabase/admin";

export { slugFromName as slugFromPropertyName };

export async function uniquePropertySlug(
  base: string,
  excludePropertyId?: string,
) {
  const supabase = createAdminClient();
  const normalized = base || "project";
  let slug = normalized;
  let suffix = 1;

  while (true) {
    let query = supabase.from("properties").select("id").eq("slug", slug);
    if (excludePropertyId) {
      query = query.neq("id", excludePropertyId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return slug;

    suffix += 1;
    slug = `${normalized}-${suffix}`;
  }
}
