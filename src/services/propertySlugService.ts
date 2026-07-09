import {
  autoSlugFromNameServer,
  normalizeManualSlug,
  validateManualSlug,
} from "@/services/propertySlugUtils";
import { createAdminClient } from "@/services/supabase/admin";

export {
  autoSlugFromName,
  autoSlugFromNameServer,
  slugFromPropertyName,
} from "@/services/propertySlugUtils";

export async function isSlugTaken(slug: string, excludePropertyId?: string) {
  const supabase = createAdminClient();
  let query = supabase.from("properties").select("id").eq("slug", slug);
  if (excludePropertyId) {
    query = query.neq("id", excludePropertyId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function uniquePropertySlug(
  base: string,
  excludePropertyId?: string,
) {
  const normalized = base.trim() || autoSlugFromNameServer("x");
  let slug = normalized;
  let suffix = 1;

  while (true) {
    if (!(await isSlugTaken(slug, excludePropertyId))) return slug;
    suffix += 1;
    slug = `${normalized}-${suffix}`;
  }
}

export async function resolveAutoPropertySlug(
  name: string,
  excludePropertyId?: string,
) {
  const base = autoSlugFromNameServer(name);
  return uniquePropertySlug(base, excludePropertyId);
}

export async function resolveManualPropertySlug(
  manualSlug: string,
  excludePropertyId?: string,
) {
  const validationError = validateManualSlug(manualSlug);
  if (validationError) throw new Error(validationError);

  const normalized = normalizeManualSlug(manualSlug);
  if (await isSlugTaken(normalized, excludePropertyId)) {
    throw new Error("SLUG_TAKEN");
  }

  return normalized;
}

export async function resolvePropertySlug(input: {
  name: string;
  manualSlug?: string | null;
  excludePropertyId?: string;
}) {
  if (input.manualSlug?.trim()) {
    return resolveManualPropertySlug(input.manualSlug, input.excludePropertyId);
  }
  return resolveAutoPropertySlug(input.name, input.excludePropertyId);
}
