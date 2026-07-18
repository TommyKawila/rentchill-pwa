import { NextResponse } from "next/server";
import { requireOwnerId } from "@/services/ownerApiGuard";
import { submitPlatformPayment } from "@/services/platformPaymentService";
import type { UpgradeTier } from "@/services/planTierService";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_TIERS: UpgradeTier[] = ["premium"];

export async function POST(request: Request) {
  try {
    const auth = requireOwnerId(request);
    if ("error" in auth) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    const planRequested = String(formData.get("plan_requested") ?? "") as UpgradeTier;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์สลิป" }, { status: 400 });
    }

    if (!VALID_TIERS.includes(planRequested)) {
      return NextResponse.json({ error: "แผนไม่ถูกต้อง" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
    }

    const payment = await submitPlatformPayment(auth.ownerId, planRequested, file);
    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "อัปโหลดสลิปไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
