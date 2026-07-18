"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { BILL_FLEX_PAY_CTA, type BillLinePayload } from "@/services/line/billFlexMessage";
import { BRAND_NAME } from "@/config/brand";

interface InvoiceLinePreviewSkinProps {
  payload: BillLinePayload;
  lineLinked: boolean;
  sending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatAmount = (amount: number) => amount.toLocaleString("th-TH");

export function InvoiceLinePreviewSkin({
  payload,
  lineLinked,
  sending = false,
  onConfirm,
  onCancel,
}: InvoiceLinePreviewSkinProps) {
  const { t } = useLocale();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onCancel, sending]);

  const lineItems = [
    { label: t("tenant.invoice.rent"), amount: payload.baseRentAmount },
    ...(payload.waterAmount > 0
      ? [{ label: t("tenant.invoice.waterLabel"), amount: payload.waterAmount }]
      : []),
    ...(payload.electricAmount > 0
      ? [{ label: t("tenant.invoice.electricLabel"), amount: payload.electricAmount }]
      : []),
    ...(payload.extraItems ?? []).map((item) => ({
      label: item.label,
      amount: item.amount,
    })),
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.invoiceGen.previewCancel")}
        className="absolute inset-0 bg-zinc-900/50"
        disabled={sending}
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-w-sm rounded-t-xl border border-zinc-100 bg-white transition-transform duration-300 ease-out sm:rounded-xl ${
          entered ? "translate-y-0" : "translate-y-full sm:translate-y-0"
        }`}
      >
        <div className="rounded-t-xl bg-rc-green px-4 py-4 text-white sm:rounded-t-xl">
          <p className="text-lg font-bold">{BRAND_NAME}</p>
          <p className="mt-1 text-base font-bold">
            {t("owner.invoiceGen.previewTitle")}
          </p>
          <p className="mt-1 text-sm text-teal-50">
            {t("owner.invoiceGen.previewSubtitle", {
              month: payload.billingMonth,
              room: payload.roomNumber,
            })}
          </p>
        </div>

        <div className="space-y-2 px-4 py-4">
          {lineItems.map((item) => (
            <div key={item.label} className="flex justify-between gap-3 text-sm">
              <span className="text-zinc-600">{item.label}</span>
              <span className="font-medium text-zinc-900">
                ฿{formatAmount(item.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-bold">
            <span>{t("owner.invoiceGen.grandTotal")}</span>
            <span className="text-rc-green">
              ฿{formatAmount(payload.totalAmount)}
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t border-zinc-100 px-4 py-4">
          {!lineLinked && (
            <p className="text-sm text-zinc-500">
              {t("owner.invoiceGen.unlinkedHint")}
            </p>
          )}
          <button
            type="button"
            disabled={sending}
            onClick={onConfirm}
            className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending
              ? t("owner.invoiceGen.sending")
              : lineLinked
                ? t("owner.invoiceGen.confirmSend")
                : t("owner.invoiceGen.confirmShare")}
          </button>
          <p className="text-center text-xs text-zinc-500">{BILL_FLEX_PAY_CTA}</p>
          <button
            type="button"
            disabled={sending}
            onClick={onCancel}
            className="min-h-12 w-full rounded-lg border border-zinc-200 text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("owner.invoiceGen.previewCancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
