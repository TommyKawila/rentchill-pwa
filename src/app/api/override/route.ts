import { NextResponse } from "next/server";
import {
  getOverrideInvoices,
  getPaidInvoicesWithSlips,
} from "@/services/invoiceOverrideService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";

export async function GET(request: Request) {
  const propertySlug = new URL(request.url).searchParams.get("property_slug");

  try {
    if (!propertySlug) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const auth = await requireOwnerProperty(request, propertySlug);
    if ("error" in auth) return auth.error;

    const [invoices, paidInvoices] = await Promise.all([
      getOverrideInvoices(propertySlug),
      getPaidInvoicesWithSlips(propertySlug),
    ]);

    return NextResponse.json({ ok: true, invoices, paidInvoices });
  } catch (error) {
    console.error("[override.GET]", { propertySlug }, error);
    const message = error instanceof Error ? error.message : "โหลดบิลไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
