"use client";

import { AlertCircle, Bell, CalendarClock, Feather, Scale, TriangleAlert, Zap, type LucideIcon } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import type { ReminderDaySettings, ReminderTier } from "@/services/paymentReminderTier";
import {
  NAMED_REMINDER_PRESETS,
  REMINDER_PRESETS,
  buildReminderSchedulePreview,
  formatReminderChipLabel,
  type NamedReminderPresetId,
  type ReminderPresetId,
} from "@/services/reminderPresetService";

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

const PRESET_VISUAL: Record<
  NamedReminderPresetId,
  {
    Icon: LucideIcon;
    iconWrap: string;
    iconColor: string;
    selectedBorder: string;
    selectedBg: string;
    chipSelected: string;
  }
> = {
  balanced: {
    Icon: Scale,
    iconWrap: "bg-rc-green-soft",
    iconColor: "text-rc-green-ink",
    selectedBorder: "border-rc-green",
    selectedBg: "bg-rc-green-soft/80",
    chipSelected: "border-rc-green/40 bg-white text-rc-green-ink",
  },
  early: {
    Icon: CalendarClock,
    iconWrap: "bg-sky-50",
    iconColor: "text-sky-700",
    selectedBorder: "border-sky-500",
    selectedBg: "bg-sky-50",
    chipSelected: "border-sky-300 bg-white text-sky-800",
  },
  gentle: {
    Icon: Feather,
    iconWrap: "bg-violet-50",
    iconColor: "text-violet-700",
    selectedBorder: "border-violet-400",
    selectedBg: "bg-violet-50",
    chipSelected: "border-violet-300 bg-white text-violet-800",
  },
  assertive: {
    Icon: Zap,
    iconWrap: "bg-orange-50",
    iconColor: "text-rc-warning",
    selectedBorder: "border-rc-warning",
    selectedBg: "bg-orange-50",
    chipSelected: "border-orange-300 bg-white text-orange-800",
  },
};

const TIER_DAY_LABEL: Record<ReminderTier, MessageKey> = {
  soft: "settings.reminderSoftDays",
  firm: "settings.reminderFirmDays",
  final: "settings.reminderFinalDays",
};

const TIER_VISUAL: Record<
  ReminderTier,
  {
    Icon: LucideIcon;
    cardBorder: string;
    cardBg: string;
    iconWrap: string;
    iconColor: string;
    labelColor: string;
  }
> = {
  soft: {
    Icon: Bell,
    cardBorder: "border-rc-green/30",
    cardBg: "bg-rc-green-soft/60",
    iconWrap: "bg-rc-green-soft",
    iconColor: "text-rc-green-ink",
    labelColor: "text-rc-green-ink",
  },
  firm: {
    Icon: AlertCircle,
    cardBorder: "border-rc-warning/40",
    cardBg: "bg-orange-50",
    iconWrap: "bg-orange-100",
    iconColor: "text-rc-warning",
    labelColor: "text-orange-900",
  },
  final: {
    Icon: TriangleAlert,
    cardBorder: "border-rc-danger/30",
    cardBg: "bg-red-50",
    iconWrap: "bg-red-100",
    iconColor: "text-rc-danger",
    labelColor: "text-red-900",
  },
};

function ReminderTierDayField({
  tier,
  value,
  onChange,
}: {
  tier: ReminderTier;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLocale();
  const visual = TIER_VISUAL[tier];
  const { Icon } = visual;

  return (
    <div
      className={`flex gap-3 rounded-lg border p-3 ${visual.cardBorder} ${visual.cardBg}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${visual.iconWrap}`}
      >
        <Icon className={`h-5 w-5 ${visual.iconColor}`} strokeWidth={2} aria-hidden />
      </div>
      <label className="min-w-0 flex-1 space-y-1 text-sm text-zinc-500">
        <span className={`font-medium ${visual.labelColor}`}>
          {t(TIER_DAY_LABEL[tier])}
        </span>
        <input
          type="number"
          min={1}
          max={28}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </label>
    </div>
  );
}

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
          const visual = PRESET_VISUAL[id];
          const { Icon } = visual;
          const chip = formatReminderChipLabel(REMINDER_PRESETS[id]);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectPreset(id)}
              className={`flex w-full gap-3 rounded-xl border p-3 text-left transition sm:p-4 ${
                selected
                  ? `${visual.selectedBorder} ${visual.selectedBg} ring-1 ring-inset ring-black/5`
                  : "border-zinc-100 bg-white hover:border-zinc-200"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${visual.iconWrap}`}
              >
                <Icon className={`h-5 w-5 ${visual.iconColor}`} strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
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
                className={`shrink-0 self-start rounded-full border px-2 py-1 text-[10px] font-semibold tabular-nums ${
                  selected
                    ? visual.chipSelected
                    : "border-zinc-100 bg-zinc-50 text-zinc-600"
                }`}
              >
                {chip}
              </span>
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
          <ReminderTierDayField
            tier="soft"
            value={softDays}
            onChange={onSoftDaysChange}
          />
          <ReminderTierDayField
            tier="firm"
            value={firmDays}
            onChange={onFirmDaysChange}
          />
          <ReminderTierDayField
            tier="final"
            value={finalDays}
            onChange={onFinalDaysChange}
          />
        </div>
      ) : null}
    </div>
  );
}
