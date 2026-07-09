import { getDemoOwnerId } from "@/services/ownerAuthService";
import { getSuperadminOwnerId } from "@/services/superadminGuard";
import { createAdminClient } from "@/services/supabase/admin";

export function isDevOwnerResetEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEV_OWNER_RESET === "true"
  );
}

export async function resetOwnerByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("EMAIL_REQUIRED");

  const supabase = createAdminClient();

  const { data: owner, error: ownerError } = await supabase
    .from("owners")
    .select("id, is_superadmin")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (ownerError) throw ownerError;
  if (!owner) throw new Error("OWNER_NOT_FOUND");

  const ownerId = String(owner.id);
  const protectedIds = new Set([getSuperadminOwnerId(), getDemoOwnerId()]);
  if (owner.is_superadmin || protectedIds.has(ownerId)) {
    throw new Error("PROTECTED_OWNER");
  }

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id")
    .eq("owner_id", ownerId);

  if (propertiesError) throw propertiesError;

  for (const property of properties ?? []) {
    const propertyId = String(property.id);

    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("id")
      .eq("property_id", propertyId);

    if (roomsError) throw roomsError;

    const roomIds = (rooms ?? []).map((room) => String(room.id));

    await supabase.from("invoices").delete().eq("property_id", propertyId);

    if (roomIds.length > 0) {
      const { error: tenantsError } = await supabase
        .from("tenants")
        .delete()
        .in("room_id", roomIds);
      if (tenantsError) throw tenantsError;
    }

    await supabase.from("rooms").delete().eq("property_id", propertyId);
    await supabase.from("line_push_log").delete().eq("property_id", propertyId);

    const { error: propertyError } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);
    if (propertyError) throw propertyError;
  }

  await supabase.from("line_push_log").delete().eq("owner_id", ownerId);
  await supabase.from("platform_payments").delete().eq("owner_id", ownerId);

  const { error: deleteOwnerError } = await supabase
    .from("owners")
    .delete()
    .eq("id", ownerId);

  if (deleteOwnerError) throw deleteOwnerError;

  return {
    email: normalizedEmail,
    deleted_properties: properties?.length ?? 0,
  };
}
