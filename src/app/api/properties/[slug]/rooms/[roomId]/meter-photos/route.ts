import { NextResponse } from "next/server";
import {
  listRoomMeterPhotos,
  uploadRoomMeterPhoto,
  type MeterUtilityType,
} from "@/services/meterPhotoService";
import { logAuditForSlug } from "@/services/auditLogService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

function parseUtilityType(value: FormDataEntryValue | null): MeterUtilityType | null {
  if (value === "water" || value === "electric") return value;
  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const url = new URL(request.url);
    const billingMonth = url.searchParams.get("billing_month") ?? undefined;

    const photos = await listRoomMeterPhotos({
      propertySlug: slug,
      roomId,
      billingMonth,
    });

    return NextResponse.json({ ok: true, photos });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดรูปไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; roomId: string }> },
) {
  try {
    const { slug, roomId } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    const utilityType = parseUtilityType(formData.get("utility_type"));
    const billingMonth = String(formData.get("billing_month") ?? "");
    const tenantId = formData.get("tenant_id");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    }
    if (!utilityType) {
      return NextResponse.json({ error: "ประเภทมิเตอร์ไม่ถูกต้อง" }, { status: 400 });
    }
    if (!billingMonth) {
      return NextResponse.json({ error: "ไม่พบรอบบิล" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    const photo = await uploadRoomMeterPhoto({
      propertySlug: slug,
      roomId,
      tenantId: tenantId ? String(tenantId) : null,
      billingMonth,
      utilityType,
      file,
      uploadedBy: "owner",
    });

    await logAuditForSlug({
      propertySlug: slug,
      roomId,
      tenantId: tenantId ? String(tenantId) : null,
      actorType: "owner",
      actorId: auth.ownerId,
      action: "meter.upload",
      detail: { utility_type: utilityType, billing_month: billingMonth },
    });

    return NextResponse.json({ ok: true, photo });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ";
    const message =
      raw === "PLAN_METER_PHOTO"
        ? "แผนนี้ไม่รองรับรูปมิเตอร์"
        : raw === "METER_CURRENT_ONLY"
          ? "แผนนี้อัปโหลดได้เฉพาะเดือนปัจจุบัน"
          : raw === "METER_HISTORY_LIMIT"
            ? "เกินช่วงเก็บรูปย้อนหลังของแผน"
            : raw;
    const status = raw === "PLAN_METER_PHOTO" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
