import { NextResponse } from "next/server";
import {
  generateMonthlyInvoices,
  getMonthlyBillingRows,
  type BillingEntry,
} from "@/services/monthlyBillingService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertySlug = searchParams.get("property_slug");

    if (!propertySlug) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, propertySlug);
    if ("error" in auth) return auth.error;

    const payload = await getMonthlyBillingRows(propertySlug);
    return NextResponse.json({ ok: true, ...payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      property_slug?: string;
      entries?: BillingEntry[];
      defer_line_notify?: boolean;
    };

    if (!body.property_slug) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    if (!body.entries?.length) {
      return NextResponse.json({ error: "ไม่มีห้องให้ออกบิล" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, body.property_slug);
    if ("error" in auth) return auth.error;

    const result = await generateMonthlyInvoices(body.property_slug, body.entries, {
      ownerId: auth.ownerId,
      deferLineNotify: body.defer_line_notify === true,
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ออกบิลไม่สำเร็จ";
    if (message === "METER_REQUIRED") {
      return NextResponse.json(
        { error: "METER_REQUIRED", message: "กรุณาใส่ค่ามิเตอร์น้ำ-ไฟก่อนออกบิล" },
        { status: 400 },
      );
    }
    if (message === "BASELINE_REQUIRED") {
      return NextResponse.json(
        {
          error: "BASELINE_REQUIRED",
          message: "ห้องนี้ยังไม่มีมิเตอร์เริ่มต้น — จดมิเตอร์วันเข้าอยู่ก่อน",
        },
        { status: 400 },
      );
    }
    if (message === "METER_ROLLED_BACK") {
      return NextResponse.json(
        {
          error: "METER_ROLLED_BACK",
          message: "เลขมิเตอร์น้อยกว่าครั้งก่อน ตรวจหน้าปัดอีกครั้ง",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
