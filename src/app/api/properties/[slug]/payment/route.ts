import { NextResponse } from "next/server";
import { validatePaymentAccountInput, parseBankAccount } from "@/services/bankAccountFormService";
import { requireOwnerProperty } from "@/services/ownerApiGuard";
import {
  getPropertyPaymentBySlug,
  updatePropertyPayment,
} from "@/services/propertyPaymentService";
import type { PropertyPaymentInput } from "@/services/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

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
    const auth = await requireOwnerProperty(request, slug);
    if ("error" in auth) return auth.error;

    const body = (await request.json()) as PropertyPaymentInput;

    const touchesPaymentAccount =
      body.prompt_pay !== undefined ||
      body.bank_account !== undefined ||
      body.receiver_name !== undefined;

    if (touchesPaymentAccount) {
      const current = await getPropertyPaymentBySlug(slug);
      const mergedBank = parseBankAccount(
        body.bank_account !== undefined
          ? body.bank_account
          : (current?.bank_account ?? null),
      );
      const issue = validatePaymentAccountInput({
        bankName: mergedBank.bankName,
        accountNumber: mergedBank.accountNumber,
        receiverName:
          body.receiver_name !== undefined
            ? (body.receiver_name ?? "")
            : (current?.receiver_name ?? ""),
      });
      if (issue === "receiver") {
        return NextResponse.json(
          { error: "RECEIVER_NAME_REQUIRED", message: "กรุณาใส่ชื่อผู้รับ" },
          { status: 400 },
        );
      }
      if (issue === "bankPair") {
        return NextResponse.json(
          { error: "BANK_PAIR_REQUIRED", message: "กรุณาใส่ทั้งธนาคารและเลขบัญชี" },
          { status: 400 },
        );
      }
    }

    const account = await updatePropertyPayment(slug, body);
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
