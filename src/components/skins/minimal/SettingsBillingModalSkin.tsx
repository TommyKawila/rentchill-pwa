"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Bell, TriangleAlert, type LucideIcon } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsReminderPresetSkin } from "@/components/skins/minimal/SettingsReminderPresetSkin";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import {
  DEFAULT_REMINDER_TEMPLATES,
  getReminderTemplate,
  previewReminderTemplate,
  sanitizeReminderTemplate,
  validateReminderTemplate,
} from "@/services/paymentReminderMessageService";
import {
  daysForReminderPreset,
  detectReminderPreset,
  parseReminderPreset,
  type NamedReminderPresetId,
  type ReminderPresetId,
} from "@/services/reminderPresetService";
import type { ReminderTier } from "@/services/paymentReminderTier";
import type { PropertyPaymentInput } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

const textareaClass = `${inputClass} min-h-[9rem] resize-y`;

const REMINDER_TIERS: ReminderTier[] = ["soft", "firm", "final"];

const TIER_DAY_LABEL: Record<ReminderTier, string> = {
  soft: "settings.reminderSoftDays",
  firm: "settings.reminderFirmDays",
  final: "settings.reminderFinalDays",
};

const TIER_TEMPLATE_VISUAL: Record<
  ReminderTier,
  {
    Icon: LucideIcon;
    cardBorder: string;
    cardBg: string;
    iconWrap: string;
    iconColor: string;
    labelColor: string;
    previewBorder: string;
    previewBg: string;
    resetColor: string;
  }
> = {
  soft: {
    Icon: Bell,
    cardBorder: "border-rc-green/30",
    cardBg: "bg-rc-green-soft/60",
    iconWrap: "bg-rc-green-soft",
    iconColor: "text-rc-green-ink",
    labelColor: "text-rc-green-ink",
    previewBorder: "border-rc-green/20",
    previewBg: "bg-white",
    resetColor: "text-rc-green-ink",
  },
  firm: {
    Icon: AlertCircle,
    cardBorder: "border-rc-warning/40",
    cardBg: "bg-orange-50",
    iconWrap: "bg-orange-100",
    iconColor: "text-rc-warning",
    labelColor: "text-orange-900",
    previewBorder: "border-rc-warning/20",
    previewBg: "bg-white",
    resetColor: "text-orange-800",
  },
  final: {
    Icon: TriangleAlert,
    cardBorder: "border-rc-danger/30",
    cardBg: "bg-red-50",
    iconWrap: "bg-red-100",
    iconColor: "text-rc-danger",
    labelColor: "text-red-900",
    previewBorder: "border-rc-danger/20",
    previewBg: "bg-white",
    resetColor: "text-red-800",
  },
};

interface SettingsBillingModalSkinProps {
  billingDay: number;
  meterReminderDays: number;
  reminderPreset?: string;
  reminderSoftDays: number;
  reminderFirmDays: number;
  reminderFinalDays: number;
  reminderTemplateSoft: string | null;
  reminderTemplateFirm: string | null;
  reminderTemplateFinal: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: Pick<
    PropertyPaymentInput,
    | "billing_day"
    | "meter_reminder_days_before"
    | "reminder_preset"
    | "reminder_soft_days"
    | "reminder_firm_days"
    | "reminder_final_days"
    | "reminder_template_soft"
    | "reminder_template_firm"
    | "reminder_template_final"
  >) => Promise<boolean>;
}

function ReminderTemplateBlock({
  tier,
  template,
  onTemplateChange,
}: {
  tier: ReminderTier;
  template: string;
  onTemplateChange: (value: string) => void;
}) {
  const { t } = useLocale();
  const visual = TIER_TEMPLATE_VISUAL[tier];
  const { Icon } = visual;

  return (
    <div
      className={`space-y-3 rounded-xl border p-4 ${visual.cardBorder} ${visual.cardBg}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${visual.iconWrap}`}
        >
          <Icon className={`h-4 w-4 ${visual.iconColor}`} strokeWidth={2} aria-hidden />
        </div>
        <span className={`text-sm font-medium ${visual.labelColor}`}>
          {t(TIER_DAY_LABEL[tier] as Parameters<typeof t>[0])}
        </span>
      </div>
      <div className="space-y-2">
        <span className="block text-sm font-medium text-zinc-900">
          {t("settings.reminderTemplateLabel")}
        </span>
        <textarea
          value={template}
          onChange={(event) => onTemplateChange(event.target.value)}
          rows={6}
          className={textareaClass}
        />
        <p className="text-sm text-zinc-500">{t("settings.reminderTemplateHint")}</p>
        <button
          type="button"
          onClick={() => onTemplateChange(DEFAULT_REMINDER_TEMPLATES[tier])}
          className={`inline-flex min-h-12 items-center text-base underline ${visual.resetColor}`}
        >
          {t("settings.reminderTemplateReset")}
        </button>
        <div
          className={`rounded-lg border p-3 ${visual.previewBorder} ${visual.previewBg}`}
        >
          <p className="text-sm font-medium text-zinc-700">
            {t("settings.reminderTemplatePreview")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">
            {previewReminderTemplate(template)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SettingsBillingModalSkin({
  billingDay: initialBillingDay,
  meterReminderDays: initialMeterReminderDays,
  reminderPreset: initialPreset,
  reminderSoftDays: initialSoft,
  reminderFirmDays: initialFirm,
  reminderFinalDays: initialFinal,
  reminderTemplateSoft: initialTemplateSoft,
  reminderTemplateFirm: initialTemplateFirm,
  reminderTemplateFinal: initialTemplateFinal,
  saving,
  onClose,
  onSave,
}: SettingsBillingModalSkinProps) {
  const { t } = useLocale();
  const [billingDay, setBillingDay] = useState(String(initialBillingDay));
  const [meterReminderDays, setMeterReminderDays] = useState(
    String(initialMeterReminderDays),
  );
  const [reminderSoftDays, setReminderSoftDays] = useState(String(initialSoft));
  const [reminderFirmDays, setReminderFirmDays] = useState(String(initialFirm));
  const [reminderFinalDays, setReminderFinalDays] = useState(String(initialFinal));
  const [preset, setPreset] = useState<ReminderPresetId>(() =>
    parseReminderPreset(initialPreset, {
      soft: initialSoft,
      firm: initialFirm,
      final: initialFinal,
    }),
  );
  const [fineTuneOpen, setFineTuneOpen] = useState(
    () =>
      parseReminderPreset(initialPreset, {
        soft: initialSoft,
        firm: initialFirm,
        final: initialFinal,
      }) === "custom",
  );
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateSoft, setTemplateSoft] = useState(
    getReminderTemplate("soft", initialTemplateSoft),
  );
  const [templateFirm, setTemplateFirm] = useState(
    getReminderTemplate("firm", initialTemplateFirm),
  );
  const [templateFinal, setTemplateFinal] = useState(
    getReminderTemplate("final", initialTemplateFinal),
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setBillingDay(String(initialBillingDay));
    setMeterReminderDays(String(initialMeterReminderDays));
    setReminderSoftDays(String(initialSoft));
    setReminderFirmDays(String(initialFirm));
    setReminderFinalDays(String(initialFinal));
    const nextPreset = parseReminderPreset(initialPreset, {
      soft: initialSoft,
      firm: initialFirm,
      final: initialFinal,
    });
    setPreset(nextPreset);
    setFineTuneOpen(nextPreset === "custom");
    setTemplateSoft(getReminderTemplate("soft", initialTemplateSoft));
    setTemplateFirm(getReminderTemplate("firm", initialTemplateFirm));
    setTemplateFinal(getReminderTemplate("final", initialTemplateFinal));
    setValidationError(null);
  }, [
    initialBillingDay,
    initialMeterReminderDays,
    initialPreset,
    initialSoft,
    initialFirm,
    initialFinal,
    initialTemplateSoft,
    initialTemplateFirm,
    initialTemplateFinal,
  ]);

  const applyDays = (soft: string, firm: string, final: string) => {
    setReminderSoftDays(soft);
    setReminderFirmDays(firm);
    setReminderFinalDays(final);
    const next = detectReminderPreset({
      soft: Number(soft) || 1,
      firm: Number(firm) || 1,
      final: Number(final) || 2,
    });
    setPreset(next);
    if (next === "custom") setFineTuneOpen(true);
  };

  const handleSelectPreset = (id: NamedReminderPresetId) => {
    const days = daysForReminderPreset(id);
    setPreset(id);
    setReminderSoftDays(String(days.soft));
    setReminderFirmDays(String(days.firm));
    setReminderFinalDays(String(days.final));
  };

  const handleSave = () => {
    for (const entry of [
      { tier: "soft" as const, text: templateSoft },
      { tier: "firm" as const, text: templateFirm },
      { tier: "final" as const, text: templateFinal },
    ]) {
      if (!validateReminderTemplate(entry.text)) {
        setValidationError(t("settings.reminderTemplateInvalid"));
        setTemplatesOpen(true);
        return;
      }
    }

    setValidationError(null);

    const nextPreset = detectReminderPreset({
      soft: Number(reminderSoftDays) || 1,
      firm: Number(reminderFirmDays) || 1,
      final: Number(reminderFinalDays) || 2,
    });

    void onSave({
      billing_day: Number(billingDay),
      meter_reminder_days_before: Number(meterReminderDays),
      reminder_preset: nextPreset,
      reminder_soft_days: Number(reminderSoftDays),
      reminder_firm_days: Number(reminderFirmDays),
      reminder_final_days: Number(reminderFinalDays),
      reminder_template_soft: sanitizeReminderTemplate("soft", templateSoft),
      reminder_template_firm: sanitizeReminderTemplate("firm", templateFirm),
      reminder_template_final: sanitizeReminderTemplate("final", templateFinal),
    }).then((ok) => {
      if (ok) onClose();
    });
  };

  return (
    <SettingsSectionModalShell
      title={t("settings.row.billing")}
      subtitle={t("settings.billingDesc")}
      onClose={onClose}
      saving={saving}
      onSave={handleSave}
    >
      <div className="space-y-4">
        <label className="block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("settings.billingDay")}</span>
          <input
            type="number"
            min={1}
            max={28}
            inputMode="numeric"
            value={billingDay}
            onChange={(event) => setBillingDay(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("settings.meterReminder")}</span>
          <input
            type="number"
            min={1}
            max={7}
            inputMode="numeric"
            value={meterReminderDays}
            onChange={(event) => setMeterReminderDays(event.target.value)}
            className={inputClass}
          />
        </label>

        <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <div>
            <p className="text-base font-medium text-zinc-900">
              {t("settings.paymentReminderTitle")}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {t("settings.paymentReminderDesc")}
            </p>
            <p className="mt-1 text-sm text-rc-green-ink">
              {t("settings.paymentReminderAutoHint")}
            </p>
          </div>

          <SettingsReminderPresetSkin
            billingDay={Number(billingDay) || 1}
            preset={preset}
            softDays={reminderSoftDays}
            firmDays={reminderFirmDays}
            finalDays={reminderFinalDays}
            fineTuneOpen={fineTuneOpen}
            onSelectPreset={handleSelectPreset}
            onFineTuneOpenChange={setFineTuneOpen}
            onSoftDaysChange={(value) =>
              applyDays(value, reminderFirmDays, reminderFinalDays)
            }
            onFirmDaysChange={(value) =>
              applyDays(reminderSoftDays, value, reminderFinalDays)
            }
            onFinalDaysChange={(value) =>
              applyDays(reminderSoftDays, reminderFirmDays, value)
            }
          />

          <button
            type="button"
            onClick={() => setTemplatesOpen((prev) => !prev)}
            className="flex min-h-12 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900"
          >
            <span>{t("settings.reminderPreset.templatesAdvanced")}</span>
            <span className="text-zinc-400">{templatesOpen ? "▾" : "▸"}</span>
          </button>

          {templatesOpen ? (
            <div className="space-y-3">
              {REMINDER_TIERS.map((tier) => (
                <ReminderTemplateBlock
                  key={tier}
                  tier={tier}
                  template={
                    tier === "soft"
                      ? templateSoft
                      : tier === "firm"
                        ? templateFirm
                        : templateFinal
                  }
                  onTemplateChange={
                    tier === "soft"
                      ? setTemplateSoft
                      : tier === "firm"
                        ? setTemplateFirm
                        : setTemplateFinal
                  }
                />
              ))}
            </div>
          ) : null}
        </div>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </SettingsSectionModalShell>
  );
}
