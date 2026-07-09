import { createAdminClient } from "@/services/supabase/admin";

const QR_BUCKET = "property-assets";

export async function uploadContactLineQr(
  propertySlug: string,
  file: File,
): Promise<string> {
  const supabase = createAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `contact-qr/${propertySlug}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(QR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) throw new Error("อัปโหลด QR ไม่สำเร็จ");

  const { data: publicUrl } = supabase.storage.from(QR_BUCKET).getPublicUrl(path);
  return publicUrl.publicUrl;
}
