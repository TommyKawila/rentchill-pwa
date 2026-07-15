"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { Invoice } from "@/services/types";
import { statusMessageKey } from "@/services/i18n/translate";
import { formatMeterDate, formatMeterNumber } from "@/services/meterFormat";
import type { MeterPhotoRow } from "@/services/meterPhotoService";

interface InvoiceSkinProps {
  invoice: Invoice;
  tenantName: string;
  roomNumber: string;
  isPaying?: boolean;
  meterPhotos?: MeterPhotoRow[];
  ownerPreview?: boolean;
  onPay?: () => void;
}

const formatAmount = (amount: number) =>
  amount.toLocaleString("th-TH", { minimumFractionDigits: 0 });

export function UtilityBreakdown({
  label,
  prev,
  curr,
  units,
  amount,
  rate,
  recordedAt,
  photoUrl,
}: {
  label: string;
  prev: number | null;
  curr: number | null;
  units: number;
  amount: number;
  rate: number | null;
  recordedAt: string | null;
  photoUrl?: string | null;
}) {
  const { t, locale } = useLocale();
  const hasDial = prev != null && curr != null;
  const effectiveRate =
    rate ?? (units > 0 ? Math.round((amount / units) * 100) / 100 : null);

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-3">
        <span className="text-base text-zinc-600">
          {label}
          {effectiveRate != null && (
            <span className="block text-sm text-zinc-500">
              {t("tenant.invoice.ratePerUnit", {
                rate: formatMeterNumber(effectiveRate),
              })}
            </span>
          )}
        </span>
        <span className="shrink-0 text-base font-bold">฿{formatAmount(amount)}</span>
      </div>
      {hasDial ? (
        <p className="text-sm text-zinc-500">
          {formatMeterNumber(prev)} → {formatMeterNumber(curr)} (
          {formatMeterNumber(units)} {t("owner.meter.unitLabel")}
          {effectiveRate != null
            ? ` × ${formatMeterNumber(effectiveRate)} ฿`
            : ""}
          )
        </p>
      ) : units > 0 ? (
        <p className="text-sm text-zinc-500">
          {formatMeterNumber(units)} {t("owner.meter.unitLabel")}
          {effectiveRate != null
            ? ` × ${formatMeterNumber(effectiveRate)} ฿`
            : ""}
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
  isPaying,
  meterPhotos = [],
  ownerPreview = false,
  onPay,
}: InvoiceSkinProps) {
  const { t } = useLocale();
  const canPay = !ownerPreview && invoice.status === "pending" && !isPaying;
  const hasRejection = Boolean(invoice.slip_rejection_note?.trim());
  const waterPhoto = meterPhotos.find((p) => p.utility_type === "water")?.public_url;
  const electricPhoto = meterPhotos.find((p) => p.utility_type === "electric")?.public_url;

  return (
    <article className="bg-zinc-50 p-6 text-zinc-900">
      <header className="border-b border-zinc-100 pb-4">
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          {t("tenant.invoice.tag")}
        </p>
        <h1 className="mt-1 text-xl font-bold tracking-tight">{tenantName}</h1>
        <p className="text-base text-zinc-600">
          {t("common.room", { number: roomNumber })} · {invoice.billing_month}
        </p>
        <span className="mt-2 inline-block rounded-lg bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
          {t(statusMessageKey(invoice.status))}
        </span>
      </header>

      <section className="mt-4 space-y-3">
        <div className="flex justify-between text-base">
          <span className="text-zinc-600">{t("tenant.invoice.rent")}</span>
          <span className="font-bold">
            ฿{formatAmount(invoice.base_rent_amount)}
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
        />
      </section>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>{t("tenant.invoice.total")}</span>
          <span>฿{formatAmount(invoice.total_amount)}</span>
        </div>
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

      {!ownerPreview && (
      <footer className="mt-6 flex flex-col items-center gap-4">
        {invoice.slip_image_url && !(hasRejection && invoice.status === "pending") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={invoice.slip_image_url}
            alt={t("tenant.invoice.slipAlt")}
            className="h-32 w-32 rounded-lg border border-zinc-200 object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white text-sm text-zinc-400"
          >
            {t("tenant.invoice.qrPlaceholder")}
          </div>
        )}
        <button
          type="button"
          onClick={onPay}
          disabled={!canPay}
          className="flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPaying
            ? t("tenant.invoice.uploading")
            : invoice.status === "pending"
              ? hasRejection
                ? t("tenant.invoice.resubmit")
                : t("tenant.invoice.pay")
              : invoice.status === "scanning"
                ? t("tenant.invoice.waitReview")
                : t("tenant.invoice.paid")}
        </button>
      </footer>
      )}
    </article>
  );
}
