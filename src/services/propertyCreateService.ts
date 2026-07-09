import { slugify } from "@/services/excel/parseWorkbook";
import { assertOwnerCanAddProject } from "@/services/ownerQuotaService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type CreatedProperty = {
  id: string;
  name: string;
  slug: string;
};

async function uniqueSlug(base: string) {
  const supabase = createAdminClient();
  let slug = base || "project";
  let suffix = 1;

  while (true) {
    const { data, error } = await supabase
      .from("properties")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    if (!data) return slug;

    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function createOwnerProperty(
  ownerId: string,
  name: string,
): Promise<CreatedProperty> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("PROJECT_NAME_REQUIRED");

  await assertOwnerCanAddProject(ownerId);

  const supabase = createAdminClient();
  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .select("plan_tier")
    .eq("id", ownerId)
    .maybeSingle();

  if (ownerError) throw ownerError;
  if (!owner) throw new Error("ไม่พบบัญชีเจ้าของ");

  const planTier = String(owner.plan_tier) as PlanTier;
  const baseSlug = slugify(trimmed) || "project";
  const slug = await uniqueSlug(baseSlug);

  const { data, error } = await supabase
    .from("properties")
    .insert({
      name: trimmed,
      slug,
      owner_id: ownerId,
      plan_tier: planTier,
    })
    .select("id, name, slug")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "สร้างโครงการไม่สำเร็จ");
  }

  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
  };
}
