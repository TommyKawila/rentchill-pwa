import { NextResponse } from "next/server";
import {
  getPropertyPaymentBySlug,
  updatePropertyPayment,
} from "@/services/propertyPaymentService";
import type { PropertyPaymentInput } from "@/services/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const account = await getPropertyPaymentBySlug(slug);

    if (!account) {
      return NextResponse.json({ error: "ไม่พบหอพัก" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const body = (await request.json()) as PropertyPaymentInput;
    const account = await updatePropertyPayment(slug, body);
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
