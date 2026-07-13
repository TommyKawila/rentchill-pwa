"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";
import { statusMessageKey } from "@/services/i18n/translate";

interface OverrideSkinProps {
  invoice: InvoiceOverrideRow;
  disabled?: boolean;
  autoVerifyEnabled?: boolean;
  billingHref?: string;
  onSaveMeters: (waterUnit: number, electricUnit: number) => void;
  onAutoVerify: () => void;
  onReject: (note?: string) => void;
  onApprove: (slipUrl?: string) => void;
}

export function OverrideSkin({
  invoice,
  disabled,
  autoVerifyEnabled = true,
  billingHref,
  onSaveMeters,
  onAutoVerify,
  onReject,
  onApprove,
}: OverrideSkinProps) {
  const { t } = useLocale();
  const [waterUnit, setWaterUnit] = useState(String(invoice.water_unit));
  const [electricUnit, setElectricUnit] = useState(String(invoice.electric_unit));
  const [slipUrl, setSlipUrl] = useState(invoice.slip_image_url ?? "");
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    setRejectNote(t("owner.override.rejectDefault"));
  }, [t]);

  const tenantSlipUrl = invoice.slip_image_url?.trim() ?? "";
  const hasTenantSlip = Boolean(tenantSlipUrl);
  const hasSlip = Boolean(slipUrl);
  const isScanning = invoice.status === "scanning";
  const hasRejection = Boolean(invoice.slip_rejection_note?.trim());

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <header className="border-b border-zinc-100 pb-3">
        <p className="text-sm font-semibold">{invoice.tenant_name}</p>
        <p className="text-xs text-zinc-500">
          {t("common.room", { number: invoice.room_number })} · {invoice.billing_month} ·{" "}
          {t(statusMessageKey(invoice.status))}
        </p>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-zinc-500">{t("owner.override.water")}</span>
          <input
            type="number"
            min={0}
            value={waterUnit}
            onChange={(event) => setWaterUnit(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-500">{t("owner.override.electric")}</span>
          <input
            type="number"
            min={0}
            value={electricUnit}
            onChange={(event) => setElectricUnit(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
      </div>

      <p className="mt-3 text-sm font-medium">
        {t("common.total")} ฿{invoice.total_amount.toLocaleString("th-TH")}
      </p>

      {hasRejection && invoice.status === "pending" && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {invoice.slip_rejection_note}
        </div>
      )}

      {isScanning && hasSlip && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
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
          className="mt-2 block text-center text-xs font-medium text-zinc-700 underline"
        >
          {t("owner.plan.slipVerifyUpgrade")}
        </a>
      )}

      {hasSlip && (
        <div className="mt-3">
          <p className="text-xs text-zinc-500">{t("owner.override.slipTenant")}</p>
          <a href={slipUrl} target="_blank" rel="noreferrer" className="mt-1 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slipUrl}
              alt={t("tenant.invoice.slipAlt")}
              className="max-h-48 w-full rounded-md border border-zinc-200 object-contain"
            />
          </a>
        </div>
      )}

      {!hasTenantSlip && (
        <label className="mt-3 block space-y-1 text-sm">
          <span className="text-zinc-500">{t("owner.override.slipOptional")}</span>
          <input
            type="url"
            value={slipUrl}
            onChange={(event) => setSlipUrl(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
      )}

      {isScanning && hasSlip && (
        <label className="mt-3 block space-y-1 text-sm">
          <span className="text-zinc-500">{t("owner.override.rejectNote")}</span>
          <input
            type="text"
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onSaveMeters(Number(waterUnit), Number(electricUnit))
          }
          className="rounded-md border border-zinc-300 py-2 text-sm font-medium disabled:opacity-50"
        >
          <EasyModeCtaIcon name="meter" />
          {t("owner.override.saveMeters")}
        </button>

        {isScanning && hasSlip && (
          <>
            {autoVerifyEnabled && (
              <button
                type="button"
                disabled={disabled}
                onClick={onAutoVerify}
                className="rounded-md border border-green-600 bg-green-50 py-2 text-sm font-medium text-green-800 disabled:opacity-50"
              >
                {t("owner.override.autoVerify")}
              </button>
            )}
            <button
              type="button"
              disabled={disabled}
              onClick={() => onReject(rejectNote)}
              className="rounded-md border border-red-300 bg-red-50 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
            >
              <EasyModeCtaIcon name="reject" />
              {t("owner.override.reject")}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => onApprove(slipUrl || undefined)}
          className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <EasyModeCtaIcon name="approve" />
          {t("owner.override.approve")}
        </button>
      </div>
    </article>
  );
}
