"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import {
  NAMED_REMINDER_PRESETS,
  REMINDER_PRESETS,
  buildReminderSchedulePreview,
  formatReminderChipLabel,
  type NamedReminderPresetId,
  type ReminderPresetId,
} from "@/services/reminderPresetService";
import type { ReminderDaySettings } from "@/services/paymentReminderTier";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

const PRESET_COPY: Record<
  NamedReminderPresetId,
  { name: MessageKey; desc: MessageKey }
> = {
  balanced: {
    name: "settings.reminderPreset.balanced",
    desc: "settings.reminderPreset.balanced.desc",
  },
  early: {
    name: "settings.reminderPreset.early",
    desc: "settings.reminderPreset.early.desc",
  },
  gentle: {
    name: "settings.reminderPreset.gentle",
    desc: "settings.reminderPreset.gentle.desc",
  },
  assertive: {
    name: "settings.reminderPreset.assertive",
    desc: "settings.reminderPreset.assertive.desc",
  },
};

interface SettingsReminderPresetSkinProps {
  billingDay: number;
  preset: ReminderPresetId;
  softDays: string;
  firmDays: string;
  finalDays: string;
  fineTuneOpen: boolean;
  onSelectPreset: (id: NamedReminderPresetId) => void;
  onFineTuneOpenChange: (open: boolean) => void;
  onSoftDaysChange: (value: string) => void;
  onFirmDaysChange: (value: string) => void;
  onFinalDaysChange: (value: string) => void;
}

export function SettingsReminderPresetSkin({
  billingDay,
  preset,
  softDays,
  firmDays,
  finalDays,
  fineTuneOpen,
  onSelectPreset,
  onFineTuneOpenChange,
  onSoftDaysChange,
  onFirmDaysChange,
  onFinalDaysChange,
}: SettingsReminderPresetSkinProps) {
  const { t, locale } = useLocale();

  const days: ReminderDaySettings = {
    soft: Number(softDays) || 1,
    firm: Number(firmDays) || 1,
    final: Number(finalDays) || 2,
  };
  const preview = buildReminderSchedulePreview(billingDay, days, locale);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-900">
        {t("settings.reminderPreset.title")}
      </p>

      <div className="space-y-2">
        {NAMED_REMINDER_PRESETS.map((id) => {
          const selected = preset === id;
          const copy = PRESET_COPY[id];
          const chip = formatReminderChipLabel(REMINDER_PRESETS[id]);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectPreset(id)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-rc-green bg-rc-green-soft"
                  : "border-zinc-100 bg-white hover:border-zinc-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900">
                      {t(copy.name)}
                    </span>
                    {id === "balanced" ? (
                      <span className="rounded-full bg-rc-green px-2 py-0.5 text-[10px] font-medium text-white">
                        {t("settings.reminderPreset.recommended")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{t(copy.desc)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold tabular-nums ${
                    selected
                      ? "border-rc-green/40 bg-white text-rc-green-ink"
                      : "border-zinc-100 bg-zinc-50 text-zinc-600"
                  }`}
                >
                  {chip}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {preset === "custom" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            {t("settings.reminderPreset.custom")}
          </p>
          <p className="mt-0.5 text-sm text-amber-800">
            {t("settings.reminderPreset.custom.desc")} ·{" "}
            {formatReminderChipLabel(days)}
          </p>
        </div>
      ) : null}

      <p className="rounded-lg border border-zinc-100 bg-white px-3 py-2 text-sm text-zinc-600">
        {t("settings.reminderPreset.preview", {
          due: preview.due,
          soft: preview.soft,
          firm: preview.firm,
          final: preview.final,
        })}
      </p>

      <button
        type="button"
        onClick={() => onFineTuneOpenChange(!fineTuneOpen)}
        className="flex min-h-12 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900"
      >
        <span>{t("settings.reminderPreset.fineTune")}</span>
        <span className="text-zinc-400">{fineTuneOpen ? "▾" : "▸"}</span>
      </button>

      {fineTuneOpen ? (
        <div className="space-y-3 rounded-xl border border-zinc-100 bg-white p-4">
          <p className="text-sm text-zinc-500">
            {t("settings.reminderPreset.fineTuneHint")}
          </p>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">
              {t("settings.reminderSoftDays")}
            </span>
            <input
              type="number"
              min={1}
              max={28}
              inputMode="numeric"
              value={softDays}
              onChange={(event) => onSoftDaysChange(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">
              {t("settings.reminderFirmDays")}
            </span>
            <input
              type="number"
              min={1}
              max={28}
              inputMode="numeric"
              value={firmDays}
              onChange={(event) => onFirmDaysChange(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">
              {t("settings.reminderFinalDays")}
            </span>
            <input
              type="number"
              min={1}
              max={28}
              inputMode="numeric"
              value={finalDays}
              onChange={(event) => onFinalDaysChange(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
