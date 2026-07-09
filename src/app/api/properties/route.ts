import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import { createOwnerProperty } from "@/services/propertyCreateService";
import { listOwnerProperties } from "@/services/ownerPropertyService";

export async function GET(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const properties = await listOwnerProperties(auth.ownerId);
    return NextResponse.json({ ok: true, properties });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดโครงการไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as { name?: string; slug?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "ต้องระบุชื่อโครงการ" }, { status: 400 });
    }

    const property = await createOwnerProperty(
      auth.ownerId,
      body.name,
      body.slug?.trim() || null,
    );
    return NextResponse.json({ ok: true, property });
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_LIMIT_EXCEEDED") {
      const detail = error as Error & { limit?: number; total?: number };
      return NextResponse.json(
        {
          error: "PROJECT_LIMIT_EXCEEDED",
          message: `เกินโควต้าโครงการ ${detail.total ?? "?"}/${detail.limit ?? "?"} — อัปเกรดแผนเพื่อเพิ่มโครงการ`,
        },
        { status: 403 },
      );
    }

    const message = error instanceof Error ? error.message : "สร้างโครงการไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
