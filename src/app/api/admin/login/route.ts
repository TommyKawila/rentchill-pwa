import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminCookieName,
} from "@/services/adminAuth";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { password?: string };
  if (body.password !== secret) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const token = await createAdminSessionToken(secret);
  const response = NextResponse.json({ ok: true });
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
