import { NextResponse } from "next/server";
import {
  deleteOwnerPushSubscription,
  getVapidPublicKey,
  isWebPushConfigured,
  upsertOwnerPushSubscription,
  type PushSubscriptionInput,
} from "@/services/webPushService";
import { requireOwnerId } from "@/services/ownerApiGuard";

function parseSubscription(body: unknown): PushSubscriptionInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const endpoint = typeof record.endpoint === "string" ? record.endpoint : null;
  const keysRaw = record.keys;
  if (!endpoint || !keysRaw || typeof keysRaw !== "object") return null;
  const keys = keysRaw as Record<string, unknown>;
  const p256dh = typeof keys.p256dh === "string" ? keys.p256dh : null;
  const auth = typeof keys.auth === "string" ? keys.auth : null;
  if (!p256dh || !auth) return null;
  return { endpoint, keys: { p256dh, auth } };
}

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ ok: false, configured: false });
  }
  return NextResponse.json({ ok: true, configured: true, publicKey });
}

export async function POST(request: Request) {
  try {
    if (!isWebPushConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Web Push not configured" },
        { status: 503 },
      );
    }

    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const subscription = parseSubscription(await request.json());
    if (!subscription) {
      return NextResponse.json({ ok: false, error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    await upsertOwnerPushSubscription(
      auth.ownerId,
      subscription,
      request.headers.get("user-agent"),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "บันทึกไม่สำเร็จ";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as { endpoint?: string };
    if (!body.endpoint) {
      return NextResponse.json({ ok: false, error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    await deleteOwnerPushSubscription(auth.ownerId, body.endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ลบไม่สำเร็จ";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
