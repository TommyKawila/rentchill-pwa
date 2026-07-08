import { NextResponse } from "next/server";
import {
  createPropertyShareLink,
  getPropertyShareLink,
} from "@/services/magicLinkService";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const link = await getPropertyShareLink(slug);
    return NextResponse.json({ ok: true, link });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดลิงก์ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const link = await createPropertyShareLink(slug);
    return NextResponse.json({ ok: true, link });
  } catch (error) {
    const message = error instanceof Error ? error.message : "สร้างลิงก์ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
