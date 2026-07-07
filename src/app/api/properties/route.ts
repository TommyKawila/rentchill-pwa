import { NextResponse } from "next/server";
import { listOwnerProperties } from "@/services/ownerPropertyService";

export async function GET() {
  try {
    const properties = await listOwnerProperties();
    return NextResponse.json({ ok: true, properties });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดหอพักไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
