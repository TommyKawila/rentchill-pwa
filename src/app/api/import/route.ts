import { NextResponse } from "next/server";
import { requireOwnerId, requireOwnerProperty } from "@/services/ownerApiGuard";
import { importPropertyRooms } from "@/services/excelImportService";
import { parseImportWorkbook } from "@/services/excel/parseWorkbook";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    if (!file.name.endsWith(".xlsx")) {
      return NextResponse.json({ error: "รองรับเฉพาะ .xlsx" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const rows = parseImportWorkbook(buffer);
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const results = await importPropertyRooms(rows, auth.ownerId);

    return NextResponse.json({
      ok: true,
      imported: results,
      roomCount: rows.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("FORBIDDEN:")) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์นำเข้าหอพักนี้" },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "ROOM_LIMIT_EXCEEDED") {
      const detail = error as Error & {
        limit?: number;
        total?: number;
      };
      return NextResponse.json(
        {
          error: `เกินโควต้าห้องรวม ${detail.total ?? "?"}/${detail.limit ?? "?"} — อัปเกรดแผนเพื่อเพิ่มห้อง`,
        },
        { status: 403 },
      );
    }

    if (error instanceof Error && error.message === "PROJECT_LIMIT_EXCEEDED") {
      const detail = error as Error & {
        limit?: number;
        total?: number;
      };
      return NextResponse.json(
        {
          error: `เกินโควต้าโครงการ ${detail.total ?? "?"}/${detail.limit ?? "?"} — อัปเกรดแผนเพื่อเพิ่มโครงการ`,
        },
        { status: 403 },
      );
    }

    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
