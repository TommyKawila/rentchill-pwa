import { NextResponse } from "next/server";
import { getOwnerIdFromRequest } from "@/services/ownerContext";
import { createAdminClient } from "@/services/supabase/admin";

const PLATFORM_SUPERADMIN_ID = "00000000-0000-0000-0000-000000000011";

export function getSuperadminOwnerId() {
  return process.env.SUPERADMIN_OWNER_ID ?? PLATFORM_SUPERADMIN_ID;
}

export async function isSuperadminOwner(ownerId: string | null | undefined) {
  if (!ownerId) return false;
  if (ownerId === getSuperadminOwnerId()) return true;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("owners")
    .select("is_superadmin")
    .eq("id", ownerId)
    .maybeSingle();

  return Boolean(data?.is_superadmin);
}

export async function requireSuperadmin(request: Request) {
  const ownerId = getOwnerIdFromRequest(request);
  if (!(await isSuperadminOwner(ownerId))) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }
  return { ownerId: ownerId! } as const;
}
