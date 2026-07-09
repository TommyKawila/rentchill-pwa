import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import {
  createPropertyShareLink,
  getPropertyShareLink,
} from "@/services/magicLinkService";

function requestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  return new URL(request.url).origin;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const link = await getPropertyShareLink(slug, requestOrigin(request));
    return NextResponse.json({ ok: true, link });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดลิงก์ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const link = await createPropertyShareLink(slug, requestOrigin(request));
    return NextResponse.json({ ok: true, link });
  } catch (error) {
    const message = error instanceof Error ? error.message : "สร้างลิงก์ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
