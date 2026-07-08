"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PlatformPaymentRow } from "@/services/platformPaymentService";

interface PlatformSlipsSkinProps {
  payments: PlatformPaymentRow[];
  disabled?: boolean;
  error?: string | null;
  onApprove: (paymentId: string) => void;
}

export function PlatformSlipsSkin({
  payments,
  disabled,
  error,
  onApprove,
}: PlatformSlipsSkinProps) {
  const { t } = useLocale();

  if (payments.length === 0) {
    return (
      <p className="text-sm text-zinc-500">{t("admin.slips.empty")}</p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {payments.map((payment) => (
        <article
          key={payment.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3"
        >
          <div className="text-sm">
            <p className="font-medium">{payment.owner_name}</p>
            <p className="text-zinc-500">{payment.owner_email}</p>
            <p className="mt-1">
              {t("admin.slips.plan")}: {payment.plan_requested}
            </p>
            <p className="text-xs text-zinc-400">
              {new Date(payment.created_at).toLocaleString("th-TH")}
            </p>
          </div>

          <a href={payment.slip_url} target="_blank" rel="noreferrer">
            <img
              src={payment.slip_url}
              alt={t("admin.slips.slipAlt")}
              className="max-h-64 w-full rounded-md border border-zinc-200 object-contain"
            />
          </a>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onApprove(payment.id)}
            className="w-full rounded-md bg-green-700 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {t("admin.slips.approve")}
          </button>
        </article>
      ))}
    </div>
  );
}
