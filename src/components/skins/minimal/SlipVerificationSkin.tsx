"use client";

import { useLocale } from "@/components/LocaleProvider";
import { SlipPinchZoomSkin } from "@/components/skins/minimal/SlipPinchZoomSkin";
import type { OverrideSavingAction } from "@/hooks/useInvoiceOverride";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";
import { formatMeterDate } from "@/services/meterFormat";

interface SlipVerificationSkinProps {
  invoice: InvoiceOverrideRow;
  disabled?: boolean;
  savingAction?: OverrideSavingAction;
  autoVerifyEnabled?: boolean;
  billingHref?: string;
  onAutoVerify: () => void;
}

export function SlipVerificationSkin({
  invoice,
  disabled,
  savingAction = null,
  autoVerifyEnabled = true,
  billingHref,
  onAutoVerify,
}: SlipVerificationSkinProps) {
  const { t, locale } = useLocale();
  const busy = disabled || savingAction !== null;
  const slipUrl = invoice.slip_image_url?.trim() ?? "";

  return (
    <article className="space-y-4">
      <section className="grid gap-4 rounded-xl border border-zinc-100 bg-white p-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-zinc-500">{t("owner.slipVerify.amountLabel")}</p>
          <p className="text-3xl font-bold text-rc-green">
            ฿{invoice.total_amount.toLocaleString("th-TH")}
          </p>
        </div>
        <div className="space-y-1 text-sm text-zinc-600">
          <p>{t("common.room", { number: invoice.room_number })}</p>
          <p>{invoice.tenant_name}</p>
          <p>
            {t("owner.slipVerify.submittedAt")}:{" "}
            {formatMeterDate(invoice.slip_submitted_at, locale)}
          </p>
        </div>
      </section>

      {slipUrl && (
        <SlipPinchZoomSkin src={slipUrl} alt={t("tenant.invoice.slipAlt")} />
      )}

      {autoVerifyEnabled && (
        <button
          type="button"
          disabled={busy}
          onClick={onAutoVerify}
          className="text-sm font-medium text-rc-green underline disabled:opacity-50"
        >
          {savingAction === "verify"
            ? t("common.saving")
            : t("owner.override.autoVerify")}
        </button>
      )}

      {!autoVerifyEnabled && billingHref && (
        <a
          href={billingHref}
          className="block text-sm font-medium text-zinc-700 underline"
        >
          {t("owner.plan.slipVerifyUpgrade")}
        </a>
      )}
    </article>
  );
}

interface SlipVerificationFooterProps {
  busy: boolean;
  savingAction: OverrideSavingAction;
  onApprove: () => void;
  onRejectClick: () => void;
}

export function SlipVerificationFooter({
  busy,
  savingAction,
  onApprove,
  onRejectClick,
}: SlipVerificationFooterProps) {
  const { t } = useLocale();

  return (
    <div className="flex shrink-0 gap-2 border-t border-zinc-100 bg-white px-4 py-3">
      <button
        type="button"
        disabled={busy}
        onClick={onApprove}
        className="flex min-h-[52px] flex-[4] items-center justify-center gap-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {savingAction === "approve" ? t("common.saving") : t("owner.slipVerify.approveCta")}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onRejectClick}
        aria-label={t("owner.slipVerify.rejectAria")}
        className="flex min-h-[52px] flex-1 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-xl text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}
