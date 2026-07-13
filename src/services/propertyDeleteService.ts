import { createAdminClient } from "@/services/supabase/admin";
import { assertNotTrialOwnerMutation } from "@/services/trialSandboxService";

const QR_BUCKET = "property-assets";

export async function deletePropertyById(propertyId: string, propertySlug?: string) {
  const supabase = createAdminClient();

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id")
    .eq("property_id", propertyId);

  if (roomsError) throw roomsError;

  const roomIds = (rooms ?? []).map((room) => String(room.id));

  const { error: invoicesError } = await supabase
    .from("invoices")
    .delete()
    .eq("property_id", propertyId);
  if (invoicesError) throw invoicesError;

  if (roomIds.length > 0) {
    const { error: tenantsError } = await supabase
      .from("tenants")
      .delete()
      .in("room_id", roomIds);
    if (tenantsError) throw tenantsError;
  }

  const { error: roomsDeleteError } = await supabase
    .from("rooms")
    .delete()
    .eq("property_id", propertyId);
  if (roomsDeleteError) throw roomsDeleteError;

  const { error: pushLogError } = await supabase
    .from("line_push_log")
    .delete()
    .eq("property_id", propertyId);
  if (pushLogError) throw pushLogError;

  if (propertySlug) {
    const prefix = `contact-qr/${propertySlug}/`;
    const { data: files, error: listError } = await supabase.storage
      .from(QR_BUCKET)
      .list(`contact-qr/${propertySlug}`);

    if (!listError && files?.length) {
      const paths = files.map((file) => `${prefix}${file.name}`);
      await supabase.storage.from(QR_BUCKET).remove(paths);
    }
  }

  const { error: propertyError } = await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId);
  if (propertyError) throw propertyError;

  return { deleted: true as const };
}

export async function deleteOwnerProperty(
  ownerId: string,
  propertySlug: string,
) {
  assertNotTrialOwnerMutation(ownerId);

  const supabase = createAdminClient();

  const { data: property, error: readError } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("slug", propertySlug)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (readError) throw readError;
  if (!property) throw new Error("ไม่พบโครงการ");

  return deletePropertyById(String(property.id), String(property.slug));
}
