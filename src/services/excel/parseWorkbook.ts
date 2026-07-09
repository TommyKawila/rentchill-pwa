import * as XLSX from "xlsx";
import type { RoomStatus } from "@/services/types";
import { slugify } from "@/services/propertySlugUtils";

export { slugify };

export type ImportRow = {
  property_name: string;
  property_slug: string;
  room_number: string;
  base_rent_price: number;
  status: RoomStatus;
};

const HEADER_MAP: Record<string, keyof ImportRow> = {
  property_name: "property_name",
  "ชื่อหอ": "property_name",
  property_slug: "property_slug",
  slug: "property_slug",
  room_number: "room_number",
  "เลขห้อง": "room_number",
  base_rent_price: "base_rent_price",
  "ค่าเช่า": "base_rent_price",
  rent: "base_rent_price",
  status: "status",
  "สถานะ": "status",
};

const VALID_STATUS = new Set<RoomStatus>(["available", "occupied", "maintenance"]);

function normalizeStatus(value: unknown): RoomStatus {
  const raw = String(value ?? "available").trim().toLowerCase();
  if (VALID_STATUS.has(raw as RoomStatus)) return raw as RoomStatus;
  if (raw === "ว่าง") return "available";
  if (raw === "มีผู้เช่า" || raw === "occupied") return "occupied";
  if (raw === "ซ่อม" || raw === "maintenance") return "maintenance";
  return "available";
}

function mapHeader(value: unknown) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return HEADER_MAP[key] ?? null;
}

export function parseImportWorkbook(buffer: ArrayBuffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("ไม่พบ sheet ในไฟล์");

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  });

  if (matrix.length < 2) throw new Error("ไฟล์ต้องมี header และอย่างน้อย 1 แถว");

  const headerRow = matrix[0] as unknown[];
  const columns = headerRow.map(mapHeader);

  if (!columns.includes("property_name") || !columns.includes("room_number")) {
    throw new Error("ต้องมีคอลัมน์ property_name และ room_number");
  }

  const rows: ImportRow[] = [];

  for (let i = 1; i < matrix.length; i++) {
    const line = matrix[i] as unknown[];
    const record: Partial<ImportRow> = {};

    columns.forEach((field, index) => {
      if (!field) return;
      record[field] = line[index] as never;
    });

    const propertyName = String(record.property_name ?? "").trim();
    const roomNumber = String(record.room_number ?? "").trim();
    if (!propertyName && !roomNumber) continue;
    if (!propertyName || !roomNumber) {
      throw new Error(`แถวที่ ${i + 1}: ข้อมูล property_name หรือ room_number ไม่ครบ`);
    }

    const rent = Number(record.base_rent_price);
    if (!Number.isFinite(rent) || rent < 0) {
      throw new Error(`แถวที่ ${i + 1}: ค่าเช่าไม่ถูกต้อง`);
    }

    const slugSource = String(record.property_slug ?? "").trim();
    rows.push({
      property_name: propertyName,
      property_slug: slugSource ? slugify(slugSource) : slugify(propertyName),
      room_number: roomNumber,
      base_rent_price: rent,
      status: normalizeStatus(record.status),
    });
  }

  if (rows.length === 0) throw new Error("ไม่พบข้อมูลห้องในไฟล์");
  if (rows.length > 500) throw new Error("รองรับสูงสุด 500 ห้องต่อไฟล์");

  return rows;
}

export function buildTemplateWorkbook() {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["property_name", "property_slug", "room_number", "base_rent_price", "status"],
    ["Demo Apartment", "demo-apartment", "101", 4500, "occupied"],
    ["Demo Apartment", "demo-apartment", "102", 4800, "available"],
    ["Demo Apartment", "demo-apartment", "103", 5000, "available"],
  ]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "rooms");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

export function summarizeImportRows(rows: ImportRow[]) {
  const slugs = new Set(rows.map((row) => row.property_slug));
  return {
    propertyCount: slugs.size,
    roomCount: rows.length,
    slugs: [...slugs],
  };
}
