import { NextResponse } from "next/server";
import {
  createLegacyAdminSessionToken,
  createOwnerSessionToken,
  getAdminCookieName,
} from "@/services/adminAuth";
import { authenticateOwner } from "@/services/ownerAuthService";
import { isSuperadminOwner } from "@/services/superadminGuard";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!password) {
    return NextResponse.json({ error: "กรุณากรอกรหัสผ่าน" }, { status: 400 });
  }

  let token: string;
  let ownerId: string;

  if (email) {
    const owner = await authenticateOwner(email, password);
    if (!owner) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
    token = await createOwnerSessionToken(owner.id, secret);
    ownerId = owner.id;
  } else if (password === secret) {
    token = await createLegacyAdminSessionToken(secret);
    ownerId = process.env.SUPERADMIN_OWNER_ID ?? "00000000-0000-0000-0000-000000000011";
  } else {
    return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const is_superadmin = await isSuperadminOwner(ownerId);

  const response = NextResponse.json({ ok: true, is_superadmin });
  response.cookies.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(getAdminCookieName());
  return response;
}
