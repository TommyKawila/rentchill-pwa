"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import { UtilityBreakdown } from "@/components/skins/minimal/InvoiceSkin";
import type { ApproveInvoiceInput } from "@/hooks/useInvoiceOverride";
import type { OverrideSavingAction } from "@/hooks/useInvoiceOverride";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";
import { statusMessageKey } from "@/services/i18n/translate";

const INPUT_CLASS =
  "w-full min-h-12 rounded-lg border border-zinc-200 px-3 text-base";
const BTN_SECONDARY =
  "min-h-12 rounded-lg border text-base font-medium disabled:cursor-not-allowed disabled:opacity-50";

interface OverrideSkinProps {
  invoice: InvoiceOverrideRow;
  disabled?: boolean;
  savingAction?: OverrideSavingAction;
  autoVerifyEnabled?: boolean;
  billingHref?: string;
  onAutoVerify: () => void;
  onReject: (note?: string) => void;
  onApprove: (input?: ApproveInvoiceInput) => void;
}

export function OverrideSkin({
  invoice,
  disabled,
  savingAction = null,
  autoVerifyEnabled = true,
  billingHref,
  onAutoVerify,
  onReject,
  onApprove,
}: OverrideSkinProps) {
  const { t } = useLocale();
  const [slipUrl, setSlipUrl] = useState(invoice.slip_image_url ?? "");
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    setRejectNote(t("owner.override.rejectDefault"));
  }, [t]);

  const tenantSlipUrl = invoice.slip_image_url?.trim() ?? "";
  const hasTenantSlip = Boolean(tenantSlipUrl);
  const hasSlip = Boolean(slipUrl);
  const isScanning = invoice.status === "scanning";
  const busy = disabled || savingAction !== null;

  return (
    <article className="rounded-xl border border-zinc-100 bg-white p-6">
      <header className="border-b border-zinc-100 pb-3">
        <p className="text-base font-semibold text-zinc-900">{invoice.tenant_name}</p>
        <p className="text-sm text-zinc-500">
          {t("common.room", { number: invoice.room_number })} · {invoice.billing_month} ·{" "}
          {t(statusMessageKey(invoice.status))}
        </p>
      </header>

      <p className="mt-3 text-sm text-zinc-500">{t("owner.invoice.metersLocked")}</p>

      <section className="mt-3 space-y-3">
        <UtilityBreakdown
          label={t("tenant.invoice.waterLabel")}
          prev={invoice.water_prev}
          curr={invoice.water_curr}
          units={invoice.water_unit}
          amount={invoice.water_amount}
          rate={invoice.water_rate_locked}
          recordedAt={invoice.water_recorded_at}
        />
        <UtilityBreakdown
          label={t("tenant.invoice.electricLabel")}
          prev={invoice.electric_prev}
          curr={invoice.electric_curr}
          units={invoice.electric_unit}
          amount={invoice.electric_amount}
          rate={invoice.electric_rate_locked}
          recordedAt={invoice.electric_recorded_at}
        />
      </section>

      <p className="mt-3 text-base font-bold text-zinc-900">
        {t("common.total")} ฿{invoice.total_amount.toLocaleString("th-TH")}
      </p>

      {isScanning && hasSlip && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t(
            autoVerifyEnabled
              ? "owner.override.scanningHint"
              : "owner.override.scanningHintManual",
          )}
        </p>
      )}

      {!autoVerifyEnabled && isScanning && hasSlip && billingHref && (
        <a
          href={billingHref}
          className="mt-3 flex min-h-12 items-center justify-center text-sm font-medium text-zinc-700 underline"
        >
          {t("owner.plan.slipVerifyUpgrade")}
        </a>
      )}

      {hasSlip && (
        <div className="mt-3">
          <p className="text-sm text-zinc-500">{t("owner.override.slipTenant")}</p>
          <a href={slipUrl} target="_blank" rel="noreferrer" className="mt-1 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slipUrl}
              alt={t("tenant.invoice.slipAlt")}
              className="max-h-48 w-full rounded-lg border border-zinc-200 object-contain"
            />
          </a>
        </div>
      )}

      {!hasTenantSlip && (
        <label className="mt-3 block space-y-1">
          <span className="text-sm text-zinc-500">{t("owner.override.slipOptional")}</span>
          <input
            type="url"
            value={slipUrl}
            disabled={busy}
            onChange={(event) => setSlipUrl(event.target.value)}
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </label>
      )}

      {isScanning && hasSlip && (
        <label className="mt-3 block space-y-1">
          <span className="text-sm text-zinc-500">{t("owner.override.rejectNote")}</span>
          <input
            type="text"
            value={rejectNote}
            disabled={busy}
            onChange={(event) => setRejectNote(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {isScanning && hasSlip && (
          <>
            {autoVerifyEnabled && (
              <button
                type="button"
                disabled={busy}
                onClick={onAutoVerify}
                className={`${BTN_SECONDARY} border-green-600 bg-green-50 text-green-800`}
              >
                {savingAction === "verify"
                  ? t("common.saving")
                  : t("owner.override.autoVerify")}
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => onReject(rejectNote)}
              className={`${BTN_SECONDARY} border-red-300 bg-red-50 text-red-600`}
            >
              <EasyModeCtaIcon name="reject" />
              {savingAction === "reject"
                ? t("common.saving")
                : t("owner.override.reject")}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onApprove({ slipUrl: slipUrl || undefined })}
          className="min-h-14 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EasyModeCtaIcon name="approve" />
          {savingAction === "approve"
            ? t("common.saving")
            : isScanning
              ? t("owner.override.approveSlipReview")
              : t("owner.override.approve")}
        </button>
      </div>
    </article>
  );
}
