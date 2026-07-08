import { NextResponse } from "next/server";
import { getOwnerIdFromRequest } from "@/services/ownerContext";
import {
  assertOwnerInvoiceAccess,
  assertOwnerPropertyAccess,
} from "@/services/ownerPropertyService";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function requireOwnerId(request: Request) {
  const ownerId = getOwnerIdFromRequest(request);
  if (!ownerId) return { error: unauthorizedResponse() } as const;
  return { ownerId } as const;
}

export async function requireOwnerProperty(request: Request, propertySlug: string) {
  const auth = requireOwnerId(request);
  if ("error" in auth) return auth;

  try {
    await assertOwnerPropertyAccess(auth.ownerId, propertySlug);
    return { ownerId: auth.ownerId } as const;
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { error: forbiddenResponse() } as const;
    }
    throw error;
  }
}

export async function requireOwnerInvoice(request: Request, invoiceId: string) {
  const auth = requireOwnerId(request);
  if ("error" in auth) return auth;

  try {
    await assertOwnerInvoiceAccess(auth.ownerId, invoiceId);
    return { ownerId: auth.ownerId } as const;
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { error: forbiddenResponse() } as const;
    }
    throw error;
  }
}
