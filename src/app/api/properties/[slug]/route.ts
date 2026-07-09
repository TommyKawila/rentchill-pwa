import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import { deleteOwnerProperty } from "@/services/propertyDeleteService";
import { renameOwnerProperty } from "@/services/propertyUpdateService";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as { name?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "ต้องระบุชื่อโครงการ" }, { status: 400 });
    }

    const property = await renameOwnerProperty(auth.ownerId, slug, body.name);

    return NextResponse.json({
      ok: true,
      property: {
        id: property.id,
        name: property.name,
        slug: property.slug,
      },
      slug_changed: property.slug_changed,
      previous_slug: property.previous_slug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "แก้ชื่อไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    await deleteOwnerProperty(auth.ownerId, slug);

    return NextResponse.json({ ok: true, deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ลบโครงการไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
