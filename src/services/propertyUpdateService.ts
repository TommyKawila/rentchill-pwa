import {
  slugFromPropertyName,
  uniquePropertySlug,
} from "@/services/propertySlugService";
import { createAdminClient } from "@/services/supabase/admin";

export type RenamedProperty = {
  id: string;
  name: string;
  slug: string;
  slug_changed: boolean;
  previous_slug: string;
};

export async function renameOwnerProperty(
  ownerId: string,
  currentSlug: string,
  name: string,
): Promise<RenamedProperty> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("PROJECT_NAME_REQUIRED");

  const supabase = createAdminClient();

  const { data: property, error: readError } = await supabase
    .from("properties")
    .select("id, name, slug")
    .eq("slug", currentSlug)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (readError) throw readError;
  if (!property) throw new Error("ไม่พบโครงการ");

  const propertyId = String(property.id);
  const previousSlug = String(property.slug);
  const nextSlug = await uniquePropertySlug(
    slugFromPropertyName(trimmed),
    propertyId,
  );

  const { data, error } = await supabase
    .from("properties")
    .update({ name: trimmed, slug: nextSlug })
    .eq("id", propertyId)
    .select("id, name, slug")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "แก้ชื่อโครงการไม่สำเร็จ");
  }

  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    slug_changed: previousSlug !== String(data.slug),
    previous_slug: previousSlug,
  };
}
