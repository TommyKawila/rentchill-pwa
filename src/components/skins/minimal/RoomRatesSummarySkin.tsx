"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomDetailSectionRow } from "@/components/skins/minimal/RoomDetailSectionRow";
import { RoomDetailSubModalShell } from "@/components/skins/minimal/RoomDetailSubModalShell";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import type { WaterBillingMode } from "@/services/propertyBillingSettingsService";
import {
  buildRoomRatesSnapshot,
  formatBaht,
} from "@/services/roomRatesDisplayService";

interface RoomRatesSummarySkinProps {
  propertySlug: string;
  row: MonthlyBillingRow;
  includeUtilities: boolean;
  waterBillingMode: WaterBillingMode;
  defaultWaterFlatBaht: number;
  waterRate: number;
  electricRate: number;
  meters: { water: string; electric: string };
  disabled?: boolean;
}

function RateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 py-3 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-right text-sm font-medium text-zinc-900">{value}</span>
    </div>
  );
}

export function RoomRatesSummarySkin({
  propertySlug,
  row,
  includeUtilities,
  waterBillingMode,
  defaultWaterFlatBaht,
  waterRate,
  electricRate,
  meters,
  disabled,
}: RoomRatesSummarySkinProps) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);

  const snapshot = useMemo(
    () =>
      buildRoomRatesSnapshot({
        row,
        includeUtilities,
        waterBillingMode,
        defaultWaterFlatBaht,
        waterRate,
        electricRate,
        meters,
      }),
    [
      row,
      includeUtilities,
      waterBillingMode,
      defaultWaterFlatBaht,
      waterRate,
      electricRate,
      meters,
    ],
  );

  const rentLabel = `฿${formatBaht(snapshot.rentMonthly, locale)}`;

  const summary = includeUtilities
    ? t("owner.roomDetail.ratesSummaryWithUtilities", {
        rent: rentLabel,
        water: snapshot.waterRateLine?.startsWith("flat:")
          ? t("owner.roomDetail.ratesWaterFlatShort", {
              amount: formatBaht(Number(snapshot.waterRateLine.slice(5)), locale),
            })
          : t("owner.roomDetail.ratesWaterMeterShort", {
              rate: formatBaht(waterRate, locale),
            }),
        electric: t("owner.roomDetail.ratesElectricShort", {
          rate: formatBaht(electricRate, locale),
        }),
      })
    : t("owner.roomDetail.ratesSummaryRentOnly", { rent: rentLabel });

  const settingsHref = `/settings?property=${encodeURIComponent(propertySlug)}`;

  return (
    <>
      <RoomDetailSectionRow
        title={t("owner.roomDetail.ratesTitle")}
        summary={summary}
        disabled={disabled}
        onOpen={() => setOpen(true)}
      />

      {open ? (
        <RoomDetailSubModalShell
          title={t("owner.roomDetail.ratesTitle")}
          subtitle={t("common.room", { number: row.room_number })}
          onClose={() => setOpen(false)}
        >
          <div className="space-y-4 pt-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4">
              <RateRow
                label={t("owner.roomDetail.ratesRent")}
                value={`฿${formatBaht(snapshot.rentMonthly, locale)}`}
              />
              {includeUtilities ? (
                <>
                  <RateRow
                    label={
                      snapshot.waterRateLine?.startsWith("flat:")
                        ? t("owner.roomDetail.ratesWaterFlat")
                        : t("owner.roomDetail.ratesWaterMeter")
                    }
                    value={
                      snapshot.waterRateLine?.startsWith("flat:")
                        ? `฿${formatBaht(defaultWaterFlatBaht, locale)}`
                        : t("owner.roomDetail.ratesPerUnit", {
                            rate: formatBaht(waterRate, locale),
                          })
                    }
                  />
                  <RateRow
                    label={t("owner.roomDetail.ratesElectric")}
                    value={t("owner.roomDetail.ratesPerUnit", {
                      rate: formatBaht(electricRate, locale),
                    })}
                  />
                </>
              ) : (
                <p className="py-3 text-sm text-zinc-500">
                  {t("owner.roomDetail.ratesNotIncluded")}
                </p>
              )}
            </div>

            {snapshot.currentMonth ? (
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {t("owner.roomDetail.ratesCurrentMonth")}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {snapshot.currentMonth.status === "issued"
                    ? t("owner.roomDetail.ratesCurrentIssued")
                    : t("owner.roomDetail.ratesCurrentDraft")}
                </p>
                <div className="mt-2 rounded-xl border border-zinc-100 bg-white px-4">
                  <RateRow
                    label={t("tenant.invoice.rent")}
                    value={`฿${formatBaht(snapshot.currentMonth.rent, locale)}`}
                  />
                  {includeUtilities && snapshot.currentMonth.water != null ? (
                    <RateRow
                      label={t("tenant.invoice.waterLabel")}
                      value={`฿${formatBaht(snapshot.currentMonth.water, locale)}`}
                    />
                  ) : null}
                  {includeUtilities && snapshot.currentMonth.electric != null ? (
                    <RateRow
                      label={t("tenant.invoice.electricLabel")}
                      value={`฿${formatBaht(snapshot.currentMonth.electric, locale)}${
                        snapshot.currentMonth.electricUnits != null
                          ? ` · ${snapshot.currentMonth.electricUnits} ${t("owner.roomDetail.ratesUnits")}`
                          : ""
                      }`}
                    />
                  ) : null}
                  {snapshot.currentMonth.total != null ? (
                    <div className="flex items-center justify-between gap-3 border-t border-zinc-100 py-3">
                      <span className="text-sm font-medium text-zinc-900">
                        {t("owner.roomDetail.ratesTotal")}
                      </span>
                      <span className="text-base font-bold text-rc-green">
                        ฿{formatBaht(snapshot.currentMonth.total, locale)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">{t("owner.roomDetail.ratesNoMeterYet")}</p>
            )}

            {includeUtilities ? (
              <a
                href={settingsHref}
                className="inline-flex min-h-12 items-center text-sm font-medium text-rc-green underline-offset-2 hover:underline"
              >
                {t("owner.roomDetail.ratesSettingsHint")}
              </a>
            ) : null}
          </div>
        </RoomDetailSubModalShell>
      ) : null}
    </>
  );
}
