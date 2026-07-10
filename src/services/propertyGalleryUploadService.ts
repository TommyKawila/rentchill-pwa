import { createAdminClient } from "@/services/supabase/admin";

const BUCKET = "property-assets";
export const MAX_GALLERY_IMAGES = 6;

export async function uploadPropertyGalleryImage(
  propertySlug: string,
  file: File,
): Promise<string> {
  const supabase = createAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `gallery/${propertySlug}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error("อัปโหลดรูปไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl.publicUrl;
}
