"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { Invoice } from "@/services/types";
import { statusMessageKey } from "@/services/i18n/translate";
import { formatMeterDate, formatMeterNumber } from "@/services/meterFormat";
import { currencySymbol, formatMoney } from "@/services/formatMoney";
import type { MeterPhotoRow } from "@/services/meterPhotoService";
import {
  buildPromptPayQrImageUrl,
  savePromptPayQrImage,
} from "@/services/promptPayQrService";

interface InvoiceSkinProps {
  invoice: Invoice;
  tenantName: string;
  roomNumber: string;
  propertyName?: string | null;
  dueDateLabel?: string | null;
  isPaying?: boolean;
  meterPhotos?: MeterPhotoRow[];
  ownerPreview?: boolean;
  promptPay?: string | null;
  bankAccount?: string | null;
  receiverName?: string | null;
  slipPreviewUrl?: string | null;
  slipAttached?: boolean;
  onAttachSlip?: () => void;
  onClearSlip?: () => void;
  onConfirmPay?: () => void;
  currency?: string;
}

function statusTone(status: Invoice["status"]) {
  if (status === "paid") return "border-rc-success/30 bg-rc-success-soft text-rc-success-ink";
  if (status === "scanning") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function UtilityBreakdown({
  label,
  prev,
  curr,
  units,
  amount,
  rate,
  recordedAt,
  photoUrl,
  currency = "THB",
}: {
  label: string;
  prev: number | null;
  curr: number | null;
  units: number;
  amount: number;
  rate: number | null;
  recordedAt: string | null;
  photoUrl?: string | null;
  currency?: string;
}) {
  const { t, locale } = useLocale();
  const symbol = currencySymbol(currency);
  const hasDial = prev != null && curr != null;
  const effectiveRate =
    rate ?? (units > 0 ? Math.round((amount / units) * 100) / 100 : null);

  if (amount <= 0 && units <= 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-3">
        <span className="text-base text-zinc-600">
          {label}
          {effectiveRate != null && (
            <span className="block text-sm text-zinc-500">
              {t("tenant.invoice.ratePerUnit", {
                rate: formatMeterNumber(effectiveRate),
                symbol,
              })}
            </span>
          )}
        </span>
        <span className="shrink-0 text-base font-bold">
          {formatMoney(amount, currency, locale)}
        </span>
      </div>
      {hasDial ? (
        <p className="text-sm text-zinc-500">
          {formatMeterNumber(prev)} → {formatMeterNumber(curr)} (
          {formatMeterNumber(units)} {t("owner.meter.unitLabel")}
          {effectiveRate != null
            ? ` × ${formatMeterNumber(effectiveRate)} ${symbol}`
            : ""}
          )
        </p>
      ) : units > 0 ? (
        <p className="text-sm text-zinc-500">
          {formatMeterNumber(units)} {t("owner.meter.unitLabel")}
        </p>
      ) : null}
      {recordedAt && (
        <p className="text-sm text-zinc-500">
          {t("owner.meter.recordedAt", {
            date: formatMeterDate(recordedAt, locale),
          })}
          {photoUrl && (
            <>
              {" · "}
              <a
                href={photoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center underline"
              >
                {t("tenant.invoice.viewPhoto")}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export function InvoiceSkin({
  invoice,
  tenantName,
  roomNumber,
  propertyName = null,
  dueDateLabel = null,
  isPaying,
  meterPhotos = [],
  ownerPreview = false,
  promptPay = null,
  bankAccount = null,
  receiverName = null,
  slipPreviewUrl = null,
  slipAttached = false,
  onAttachSlip,
  onClearSlip,
  onConfirmPay,
  currency = "THB",
}: InvoiceSkinProps) {
  const { t, locale } = useLocale();
  const [savingQr, setSavingQr] = useState(false);
  const hasRejection = Boolean(invoice.slip_rejection_note?.trim());
  const waterPhoto = meterPhotos.find((p) => p.utility_type === "water")?.public_url;
  const electricPhoto = meterPhotos.find((p) => p.utility_type === "electric")?.public_url;
  const qrUrl =
    invoice.include_promptpay_qr && promptPay
      ? buildPromptPayQrImageUrl(promptPay, invoice.total_amount)
      : null;
  const canConfirm =
    !ownerPreview &&
    invoice.status === "pending" &&
    slipAttached &&
    !isPaying;

  const handleSaveQr = async () => {
    if (!qrUrl) return;
    setSavingQr(true);
    try {
      await savePromptPayQrImage(qrUrl);
    } catch (err) {
      console.error("[InvoiceSkin.saveQr]", err);
    } finally {
      setSavingQr(false);
    }
  };

  return (
    <article className="bg-zinc-50 p-6 text-zinc-900">
      <header className="border-b border-zinc-100 pb-4">
        <span
          className={`inline-flex rounded-lg border px-3 py-1 text-sm font-medium ${statusTone(invoice.status)}`}
        >
          {t(statusMessageKey(invoice.status))}
        </span>
        {dueDateLabel && invoice.status === "pending" && (
          <p className="mt-3 text-sm text-zinc-600">
            {t("tenant.invoice.dueBy", { date: dueDateLabel })}
          </p>
        )}
        <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900">
          {propertyName ?? tenantName}
        </h1>
        <p className="mt-1 text-base text-zinc-600">
          {t("common.room", { number: roomNumber })} · {invoice.billing_month}
        </p>
      </header>

      <section className="mt-4 space-y-3">
        <div className="flex justify-between text-base">
          <span className="text-zinc-600">{t("tenant.invoice.rent")}</span>
          <span className="font-bold">
            {formatMoney(invoice.base_rent_amount, currency, locale)}
          </span>
        </div>
        <UtilityBreakdown
          label={t("tenant.invoice.waterLabel")}
          prev={invoice.water_prev}
          curr={invoice.water_curr}
          units={invoice.water_unit}
          amount={invoice.water_amount}
          rate={invoice.water_rate_locked}
          recordedAt={invoice.water_recorded_at}
          photoUrl={waterPhoto}
          currency={currency}
        />
        <UtilityBreakdown
          label={t("tenant.invoice.electricLabel")}
          prev={invoice.electric_prev}
          curr={invoice.electric_curr}
          units={invoice.electric_unit}
          amount={invoice.electric_amount}
          rate={invoice.electric_rate_locked}
          recordedAt={invoice.electric_recorded_at}
          photoUrl={electricPhoto}
          currency={currency}
        />
        {invoice.extra_items.map((item) => (
          <div key={item.label} className="flex justify-between text-base">
            <span className="text-zinc-600">{item.label}</span>
            <span className="font-bold">
              {formatMoney(item.amount, currency, locale)}
            </span>
          </div>
        ))}
      </section>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        <p className="text-sm font-medium text-zinc-500">
          {t("tenant.invoice.total")}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
          {formatMoney(invoice.total_amount, currency, locale)}
        </p>
      </div>

      {invoice.status === "scanning" && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-800">
          {t("tenant.invoice.scanning")}
        </div>
      )}

      {hasRejection && invoice.status === "pending" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-600">
          <p className="font-medium">{t("tenant.invoice.rejected")}</p>
          <p className="mt-1">{invoice.slip_rejection_note}</p>
        </div>
      )}

      {invoice.status === "paid" && (
        <div className="mt-4 rounded-xl border border-zinc-100 bg-white p-4 text-base text-zinc-600">
          {t("tenant.invoice.paidNote")}
        </div>
      )}

      {!ownerPreview && invoice.status === "pending" && (
        <section className="mt-6 space-y-4">
          {(qrUrl || bankAccount || receiverName) && (
            <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center">
              <p className="text-sm font-medium text-zinc-900">
                {t("tenant.invoice.qrSectionTitle")}
              </p>
              {receiverName && (
                <p className="mt-1 text-sm text-zinc-600">{receiverName}</p>
              )}
              {bankAccount && (
                <p className="text-sm text-zinc-600">{bankAccount}</p>
              )}
              {qrUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt={t("tenant.invoice.qrAlt")}
                    className="mx-auto mt-3 h-44 w-44 rounded-lg border border-zinc-100"
                  />
                  <button
                    type="button"
                    disabled={savingQr}
                    onClick={() => void handleSaveQr()}
                    className="mt-3 min-h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-900 disabled:opacity-50"
                  >
                    {savingQr
                      ? t("tenant.invoice.savingQr")
                      : t("tenant.invoice.saveQr")}
                  </button>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">
                  {t("tenant.invoice.qrPlaceholder")}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-900">
              {t("tenant.invoice.slipSectionTitle")}
            </p>
            {slipPreviewUrl ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slipPreviewUrl}
                  alt={t("tenant.invoice.slipAlt")}
                  className="mx-auto max-h-48 w-full rounded-xl border border-zinc-200 object-contain"
                />
                {onClearSlip && (
                  <button
                    type="button"
                    onClick={onClearSlip}
                    className="min-h-12 w-full text-sm text-zinc-600 underline"
                  >
                    {t("tenant.invoice.changeSlip")}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onAttachSlip}
                className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-4 text-center text-sm text-zinc-600"
              >
                <span className="text-2xl text-zinc-400">+</span>
                <span>{t("tenant.invoice.attachSlip")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onConfirmPay}
              disabled={!canConfirm}
              className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPaying
                ? t("tenant.invoice.uploading")
                : t("tenant.invoice.confirmPay")}
            </button>
            {!slipAttached && (
              <p className="text-center text-sm text-zinc-500">
                {t("tenant.invoice.confirmPayHint")}
              </p>
            )}
          </div>
        </section>
      )}

      {!ownerPreview && invoice.status !== "pending" && invoice.slip_image_url && (
        <footer className="mt-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={invoice.slip_image_url}
            alt={t("tenant.invoice.slipAlt")}
            className="h-32 w-32 rounded-lg border border-zinc-200 object-cover"
          />
        </footer>
      )}
    </article>
  );
}
