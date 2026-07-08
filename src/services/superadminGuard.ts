import { NextResponse } from "next/server";
import { getOwnerIdFromRequest } from "@/services/ownerContext";

const DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000010";

export function getSuperadminOwnerId() {
  return process.env.SUPERADMIN_OWNER_ID ?? DEMO_OWNER_ID;
}

export function isSuperadminOwner(ownerId: string | null | undefined) {
  if (!ownerId) return false;
  return ownerId === getSuperadminOwnerId();
}

export function requireSuperadmin(request: Request) {
  const ownerId = getOwnerIdFromRequest(request);
  if (!isSuperadminOwner(ownerId)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }
  return { ownerId: ownerId! } as const;
}
