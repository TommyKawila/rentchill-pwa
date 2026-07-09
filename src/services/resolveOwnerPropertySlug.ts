import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

export function resolveOwnerPropertySlug(
  slugFromUrl: string | null,
  properties: OwnerPropertyOption[],
  propertiesLoading: boolean,
) {
  if (slugFromUrl) {
    const isOwned = properties.some((property) => property.slug === slugFromUrl);
    if (isOwned || (propertiesLoading && properties.length === 0)) {
      return slugFromUrl;
    }
  }

  return properties[0]?.slug ?? "";
}
