import { NextResponse } from "next/server";
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
    const results = await importPropertyRooms(rows);

    return NextResponse.json({
      ok: true,
      imported: results,
      roomCount: rows.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
