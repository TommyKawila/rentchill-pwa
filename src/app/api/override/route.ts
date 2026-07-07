import { NextResponse } from "next/server";
import { getOverrideInvoices } from "@/services/invoiceOverrideService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertySlug = searchParams.get("property_slug");

    if (!propertySlug) {
      return NextResponse.json({ error: "ต้องระบุ property_slug" }, { status: 400 });
    }

    const invoices = await getOverrideInvoices(propertySlug);
    return NextResponse.json({ ok: true, invoices });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
