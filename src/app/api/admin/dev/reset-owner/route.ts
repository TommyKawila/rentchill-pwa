import { NextResponse } from "next/server";
import {
  isDevOwnerResetEnabled,
  resetOwnerByEmail,
} from "@/services/ownerDevResetService";

export async function POST(request: Request) {
  if (!isDevOwnerResetEnabled()) {
    return NextResponse.json({ error: "Dev reset disabled" }, { status: 403 });
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_SECRET not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { email?: string; dev_secret?: string };
  if (body.dev_secret !== secret) {
    return NextResponse.json({ error: "Invalid dev secret" }, { status: 401 });
  }

  try {
    const result = await resetOwnerByEmail(body.email ?? "");
    const response = NextResponse.json({ ok: true, ...result });
    response.cookies.delete("rc_admin");
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "OWNER_NOT_FOUND") {
        return NextResponse.json({ error: "ไม่พบบัญชีอีเมลนี้" }, { status: 404 });
      }
      if (error.message === "PROTECTED_OWNER") {
        return NextResponse.json(
          { error: "ไม่สามารถลบบัญชี demo หรือ superadmin" },
          { status: 403 },
        );
      }
      if (error.message === "EMAIL_REQUIRED") {
        return NextResponse.json({ error: "กรุณาระบุอีเมล" }, { status: 400 });
      }
    }

    const message = error instanceof Error ? error.message : "ลบบัญชีไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
