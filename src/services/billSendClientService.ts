import {
  buildBillPlainText,
  buildLineTextShareUrl,
  type BillLinePayload,
} from "@/services/line/billFlexMessage";

export type { BillLinePayload };

export async function sendBillToLine(input: {
  propertySlug: string;
  tenantId: string;
  billingMonth: string;
}) {
  const response = await fetch("/api/billing/send-line", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      property_slug: input.propertySlug,
      tenant_id: input.tenantId,
      billing_month: input.billingMonth,
    }),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    error?: string;
    result?: { sent: boolean; reason?: string };
  };

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? "ส่งบิลไม่สำเร็จ");
  }

  return payload.result ?? { sent: false };
}

export function copyBillPlainText(payload: BillLinePayload) {
  const text = buildBillPlainText(payload);
  return navigator.clipboard.writeText(text).then(() => text);
}

export function shareBillPlainText(payload: BillLinePayload) {
  const text = buildBillPlainText(payload);
  if (typeof navigator.share === "function") {
    return navigator.share({ text }).then(() => true);
  }
  window.open(buildLineTextShareUrl(text), "_blank", "noopener,noreferrer");
  return Promise.resolve(true);
}
