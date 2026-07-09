import { NextResponse } from "next/server";
import {
  createOwnerSessionToken,
  getAdminCookieName,
} from "@/services/adminAuth";
import { signupOwner } from "@/services/ownerSignupService";

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  try {
    const owner = await signupOwner({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    const token = await createOwnerSessionToken(owner.id, secret);
    const response = NextResponse.json({ ok: true, owner_id: owner.id });
    response.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_EXISTS") {
        return NextResponse.json(
          { error: "อีเมลนี้ถูกใช้แล้ว" },
          { status: 409 },
        );
      }
      if (error.message === "PASSWORD_TOO_SHORT") {
        return NextResponse.json(
          { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
          { status: 400 },
        );
      }
      if (error.message === "NAME_REQUIRED" || error.message === "EMAIL_REQUIRED") {
        return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
      }
    }

    const message = error instanceof Error ? error.message : "สมัครไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
