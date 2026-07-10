import { NextResponse } from "next/server";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import {
  appendGalleryUrl,
  removeGalleryUrl,
} from "@/services/propertyMarketingService";
import { uploadPropertyGalleryImage } from "@/services/propertyGalleryUploadService";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    const url = await uploadPropertyGalleryImage(slug, file);
    const marketing = await appendGalleryUrl(slug, url);

    return NextResponse.json({ ok: true, url, marketing });
  } catch (error) {
    if (error instanceof Error && error.message === "GALLERY_LIMIT") {
      return NextResponse.json(
        { error: "GALLERY_LIMIT", message: "อัปโหลดได้สูงสุด 6 รูป" },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ";
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

    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "ไม่พบ url" }, { status: 400 });
    }

    const marketing = await removeGalleryUrl(slug, url);
    return NextResponse.json({ ok: true, marketing });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ลบรูปไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
