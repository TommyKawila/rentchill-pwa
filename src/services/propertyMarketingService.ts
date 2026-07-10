import { createAdminClient } from "@/services/supabase/admin";
import { createServerClient } from "@/services/supabase/server";
import { MAX_GALLERY_IMAGES } from "@/services/propertyGalleryUploadService";

export type PropertyMarketing = {
  property_id: string;
  property_slug: string;
  marketing_description: string | null;
  marketing_address: string | null;
  gallery_urls: string[];
};

export type PropertyMarketingInput = {
  marketing_description?: string | null;
  marketing_address?: string | null;
};

const marketingSelect =
  "id, slug, marketing_description, marketing_address, gallery_urls";

function parseGalleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapMarketing(row: Record<string, unknown>): PropertyMarketing {
  return {
    property_id: String(row.id),
    property_slug: String(row.slug),
    marketing_description: row.marketing_description
      ? String(row.marketing_description)
      : null,
    marketing_address: row.marketing_address
      ? String(row.marketing_address)
      : null,
    gallery_urls: parseGalleryUrls(row.gallery_urls),
  };
}

export async function getPropertyMarketingBySlug(
  slug: string,
): Promise<PropertyMarketing | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select(marketingSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMarketing(data) : null;
}

export async function updatePropertyMarketing(
  slug: string,
  input: PropertyMarketingInput,
): Promise<PropertyMarketing> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("properties")
    .update({
      ...(input.marketing_description !== undefined
        ? {
            marketing_description: input.marketing_description?.trim() || null,
          }
        : {}),
      ...(input.marketing_address !== undefined
        ? { marketing_address: input.marketing_address?.trim() || null }
        : {}),
    })
    .eq("slug", slug)
    .select(marketingSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "บันทึกข้อมูลหน้าโปรโมทไม่สำเร็จ");
  }

  return mapMarketing(data);
}

export async function appendGalleryUrl(
  slug: string,
  url: string,
): Promise<PropertyMarketing> {
  const current = await getPropertyMarketingBySlugAdmin(slug);
  if (!current) throw new Error("ไม่พบหอพัก");

  const next = [...current.gallery_urls, url];
  if (next.length > MAX_GALLERY_IMAGES) {
    throw new Error("GALLERY_LIMIT");
  }

  return setGalleryUrls(slug, next);
}

export async function removeGalleryUrl(
  slug: string,
  url: string,
): Promise<PropertyMarketing> {
  const current = await getPropertyMarketingBySlugAdmin(slug);
  if (!current) throw new Error("ไม่พบหอพัก");

  return setGalleryUrls(
    slug,
    current.gallery_urls.filter((item) => item !== url),
  );
}

async function getPropertyMarketingBySlugAdmin(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select(marketingSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMarketing(data) : null;
}

async function setGalleryUrls(slug: string, urls: string[]) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .update({ gallery_urls: urls })
    .eq("slug", slug)
    .select(marketingSelect)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "อัปเดตรูปไม่สำเร็จ");
  }

  return mapMarketing(data);
}
