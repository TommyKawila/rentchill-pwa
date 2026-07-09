import { assertOwnerCanAddProject } from "@/services/ownerQuotaService";
import { resolvePropertySlug } from "@/services/propertySlugService";
import type { PlanTier } from "@/services/propertyQuotaService";
import { createAdminClient } from "@/services/supabase/admin";

export type CreatedProperty = {
  id: string;
  name: string;
  slug: string;
};

export async function createOwnerProperty(
  ownerId: string,
  name: string,
  manualSlug?: string | null,
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
  const slug = await resolvePropertySlug({ name: trimmed, manualSlug });

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
