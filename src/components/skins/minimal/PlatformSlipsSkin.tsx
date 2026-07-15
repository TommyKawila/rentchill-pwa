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
      <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-base text-zinc-500">
        {t("admin.slips.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {payments.map((payment) => (
        <article
          key={payment.id}
          className="space-y-3 rounded-xl border border-zinc-100 bg-white p-6"
        >
          <div className="text-base">
            <p className="font-semibold">{payment.owner_name}</p>
            <p className="text-zinc-500">{payment.owner_email}</p>
            <p className="mt-1">
              {t("admin.slips.plan")}: {payment.plan_requested}
            </p>
            <p className="text-sm text-zinc-500">
              {new Date(payment.created_at).toLocaleString("th-TH")}
            </p>
          </div>

          <a href={payment.slip_url} target="_blank" rel="noreferrer">
            <img
              src={payment.slip_url}
              alt={t("admin.slips.slipAlt")}
              className="max-h-64 w-full rounded-lg border border-zinc-200 object-contain"
            />
          </a>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onApprove(payment.id)}
            className="flex min-h-14 w-full items-center justify-center rounded-lg bg-green-700 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disabled ? t("common.saving") : t("admin.slips.approve")}
          </button>
        </article>
      ))}
    </div>
  );
}
