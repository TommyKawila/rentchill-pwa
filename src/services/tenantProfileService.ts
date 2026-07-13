import { assertOwnerPropertyAccess } from "@/services/ownerPropertyService";
import { createAdminClient } from "@/services/supabase/admin";

export type UpdateTenantProfileInput = {
  property_slug: string;
  tenant_id: string;
  tenant_name: string;
};

export type TenantProfileResult = {
  tenant_id: string;
  tenant_name: string;
};

async function assertOwnerTenantAccess(
  ownerId: string,
  propertySlug: string,
  tenantId: string,
) {
  const { id: propertyId } = await assertOwnerPropertyAccess(ownerId, propertySlug);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("id, room_id, rooms!inner(property_id)")
    .eq("id", tenantId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("TENANT_NOT_FOUND");

  const roomRaw = data.rooms as { property_id: string } | { property_id: string }[];
  const room = Array.isArray(roomRaw) ? roomRaw[0] : roomRaw;
  if (String(room.property_id) !== propertyId) throw new Error("FORBIDDEN");

  return String(data.id);
}

export async function updateTenantProfile(
  ownerId: string,
  input: UpdateTenantProfileInput,
): Promise<TenantProfileResult> {
  const tenantName = input.tenant_name.trim();

  if (!tenantName) throw new Error("TENANT_NAME_REQUIRED");

  await assertOwnerTenantAccess(ownerId, input.property_slug, input.tenant_id);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .update({
      name: tenantName,
      title_prefix: null,
    })
    .eq("id", input.tenant_id)
    .select("id, name")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "อัปเดตข้อมูลลูกบ้านไม่สำเร็จ");
  }

  return {
    tenant_id: String(data.id),
    tenant_name: String(data.name),
  };
}
