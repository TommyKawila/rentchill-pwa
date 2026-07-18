"use client";

import { useState } from "react";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import { MeterEntryChoiceSheetSkin } from "@/components/skins/minimal/MeterEntryChoiceSheetSkin";
import { useLocale } from "@/components/LocaleProvider";

interface BillingCommandCenterSkinProps {
  notIssued: number;
  readyCount: number;
  pendingMeterCount: number;
  includeUtilities: boolean;
  canBulkMeterDay: boolean;
  disabled?: boolean;
  saving?: boolean;
  onGoFillMeters: () => void;
  onBulkMeterDay: () => void;
  onBulkIssue: () => void;
  result?: {
    created: number;
    updated: number;
    skipped: number;
  } | null;
}

function StatRow({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold tabular-nums text-zinc-900">{count}</span>
      <span className="text-base text-zinc-700">{label}</span>
    </div>
  );
}

export function BillingCommandCenterSkin({
  notIssued,
  readyCount,
  pendingMeterCount,
  includeUtilities,
  canBulkMeterDay,
  disabled,
  saving,
  onGoFillMeters,
  onBulkMeterDay,
  onBulkIssue,
  result,
}: BillingCommandCenterSkinProps) {
  const { t } = useLocale();
  const [meterSheetOpen, setMeterSheetOpen] = useState(false);

  const showStep1 = includeUtilities && pendingMeterCount > 0;
  const showStep2 = notIssued > 0;
  const showMeterChoiceSheet =
    canBulkMeterDay && pendingMeterCount >= 5;

  if (!showStep1 && !showStep2) return null;

  const handleStartMeter = () => {
    if (showMeterChoiceSheet) {
      setMeterSheetOpen(true);
      return;
    }
    onGoFillMeters();
  };

  return (
    <>
      <section className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">
            {t("owner.command.title")}
          </h2>
        </div>

        {showStep1 && (
          <div className="space-y-4 px-6 py-4">
            <p className="text-sm font-medium text-zinc-500">{t("owner.command.step1")}</p>
            <p className="text-base text-zinc-700">
              {t("owner.command.pendingMeterStat", { count: pendingMeterCount })}
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={handleStartMeter}
              className="flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("owner.meterEntry.start")}
            </button>
          </div>
        )}

        {showStep2 && (
          <div className="space-y-4 px-6 py-4">
            <p className="text-sm font-medium text-zinc-500">{t("owner.command.step2")}</p>
            <div className="space-y-2">
              <p className="text-base text-zinc-700">
                {t("owner.command.notIssuedStat", { count: notIssued })}
              </p>
              {readyCount > 0 && (
                <StatRow count={readyCount} label={t("owner.command.readyStat")} />
              )}
            </div>
            <div className="space-y-3">
              <button
                type="button"
                disabled={disabled || readyCount === 0 || saving}
                onClick={onBulkIssue}
                className="flex min-h-[52px] w-full items-center justify-center gap-x-2 rounded-xl bg-rc-green text-base font-bold text-white shadow-[0_4px_14px_-4px_rgba(13,148,136,0.45)] hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <EasyModeCtaIcon name="bill" />
                {saving
                  ? t("common.saving")
                  : t("owner.billing.issueAllCta", { count: readyCount })}
              </button>
              {readyCount === 0 && includeUtilities && pendingMeterCount > 0 && (
                <p className="text-sm text-zinc-500">{t("owner.billing.meterRequired")}</p>
              )}
              {result && (
                <p className="rounded-lg border border-rc-green/30 bg-rc-green-soft px-4 py-3 text-base text-rc-green-ink">
                  {t("owner.billing.result", {
                    created: result.created,
                    updated: result.updated,
                    skipped: result.skipped,
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      <MeterEntryChoiceSheetSkin
        open={meterSheetOpen}
        disabled={disabled}
        saving={saving}
        onClose={() => setMeterSheetOpen(false)}
        onChooseList={onGoFillMeters}
        onChooseWalkthrough={onBulkMeterDay}
      />
    </>
  );
}
