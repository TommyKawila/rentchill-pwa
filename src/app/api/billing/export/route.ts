import { NextResponse } from "next/server";
import { exportPropertyCsv } from "@/services/csvExportService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertySlug = searchParams.get("property_slug");

    if (!propertySlug) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const result = await exportPropertyCsv(propertySlug);

    return new NextResponse(result.csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTA_EXCEEDED") {
      return NextResponse.json(
        { error: "QUOTA_EXCEEDED", message: "ใช้โควต้า CSV ครบแล้วเดือนนี้" },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "NO_DATA") {
      return NextResponse.json(
        { error: "NO_DATA", message: "ไม่มีบิลเดือนนี้ให้ส่งออก" },
        { status: 404 },
      );
    }

    const message = error instanceof Error ? error.message : "ส่งออก CSV ไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
