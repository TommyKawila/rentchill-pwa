"use client";

import { AlertTriangle, Bell, TriangleAlert } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { EasyModeCtaIcon } from "@/components/skins/minimal/EasyModeCtaIcon";
import type { MonthlyBillingRow } from "@/services/monthlyBillingService";
import {
  type ReminderDaySettings,
  type ReminderStepStatus,
  type ReminderTier,
  type ReminderTimeline,
} from "@/services/paymentReminderTier";
import {
  REMINDER_TIER_BUTTON_CLASS,
  reminderTierMessageKey,
} from "@/services/reminderUi";
import {
  daysUntilBangkokDate,
  formatBangkokLocaleDate,
  nextBillCycleDate,
} from "@/services/billingDueDateService";

interface RoomBillingReminderPanelSkinProps {
  row: MonthlyBillingRow;
  billingMonth: string;
  billingDay: number;
  settings: ReminderDaySettings;
  disabled?: boolean;
  canRemind?: boolean;
  reminderDisabled?: boolean;
  remindedTenantId?: string | null;
  onRemind: (tenantId: string, tier: ReminderTier) => void;
}

const TIER_META: {
  tier: ReminderTier;
  icon: typeof Bell;
  whenKey:
    | "owner.reminder.timeline.tierSoft"
    | "owner.reminder.timeline.tierFirm"
    | "owner.reminder.timeline.tierFinal";
}[] = [
  { tier: "soft", icon: Bell, whenKey: "owner.reminder.timeline.tierSoft" },
  { tier: "firm", icon: AlertTriangle, whenKey: "owner.reminder.timeline.tierFirm" },
  { tier: "final", icon: TriangleAlert, whenKey: "owner.reminder.timeline.tierFinal" },
];

function tierDayLabel(tier: ReminderTier, settings: ReminderDaySettings) {
  if (tier === "soft") return `−${settings.soft}`;
  if (tier === "firm") return `+${settings.firm}`;
  return `+${settings.final}`;
}

function timelineTierKey(tier: ReminderTier) {
  return TIER_META.find((item) => item.tier === tier)!.whenKey;
}

function buildSummary(timeline: ReminderTimeline, tierSent: ReminderTier | null) {
  if (timeline.allTiersSent) {
    return { key: "owner.reminder.timeline.exhausted" as const, params: {} };
  }

  const nextTier = timeline.nextTier;
  if (!nextTier) return null;

  if (
    timeline.daysUntilNext === null ||
    timeline.daysUntilNext <= 0
  ) {
    return {
      key: "owner.reminder.timeline.ready" as const,
      params: { tier: nextTier },
    };
  }

  if (tierSent) {
    return {
      key: "owner.reminder.timeline.sentWaiting" as const,
      params: {
        tier: tierSent,
        days: timeline.daysUntilNext,
        nextTier,
      },
    };
  }

  return {
    key: "owner.reminder.timeline.countdown" as const,
    params: { days: timeline.daysUntilNext, tier: nextTier },
  };
}

function stepRowClass(tier: ReminderTier, status: ReminderStepStatus) {
  if (status === "done") {
    return REMINDER_TIER_BUTTON_CLASS[tier];
  }
  if (status === "ready") {
    return `${REMINDER_TIER_BUTTON_CLASS[tier]} ring-1 ring-inset ring-current/20`;
  }
  if (status === "countdown") {
    return "border-zinc-100 bg-white text-zinc-700";
  }
  return "border-zinc-100 bg-zinc-50/80 text-zinc-400";
}

export function RoomBillingReminderPanelSkin({
  row,
  billingMonth,
  billingDay,
  settings,
  disabled,
  canRemind,
  reminderDisabled,
  remindedTenantId,
  onRemind,
}: RoomBillingReminderPanelSkinProps) {
  const { t, locale } = useLocale();
  const timeline = row.reminder_timeline;
  const tierSent = row.reminder_tier_sent;
  const summary = timeline ? buildSummary(timeline, tierSent) : null;

  const lastIssuedLabel = row.issued_at
    ? t("owner.roomDetail.reminderLastIssued", {
        date: formatBangkokLocaleDate(row.issued_at, locale) ?? "—",
      })
    : t("owner.roomDetail.reminderLastIssuedUnknown");

  const nextBillDate = nextBillCycleDate(
    billingMonth,
    billingDay,
    Boolean(row.invoice_id),
  );
  const nextBillDays = nextBillDate ? daysUntilBangkokDate(nextBillDate) : null;
  const nextBillLabel =
    nextBillDate && nextBillDays != null
      ? nextBillDays <= 0
        ? t("owner.roomDetail.reminderNextBillToday", {
            date: formatBangkokLocaleDate(nextBillDate, locale) ?? "—",
          })
        : t("owner.roomDetail.reminderNextBill", {
            date: formatBangkokLocaleDate(nextBillDate, locale) ?? "—",
            days: nextBillDays,
          })
      : null;

  const tierLabel = (tier: ReminderTier) => t(timelineTierKey(tier));

  const stepHint = (tier: ReminderTier, status: ReminderStepStatus) => {
    if (status === "done") {
      return t("owner.reminder.timeline.chipDoneLabel");
    }
    if (status === "ready") {
      return t("owner.reminder.timeline.chipReadyLabel");
    }
    return t("owner.reminder.timeline.chipScheduled", {
      tier: tierLabel(tier),
      day: tierDayLabel(tier, settings),
    });
  };

  const showSoftCountdown =
    !timeline &&
    row.reminder_days_until_soft != null &&
    row.reminder_days_until_soft > 0;

  if (!timeline && !showSoftCountdown && !row.reminder_can_send) {
    return null;
  }

  return (
    <section className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-rc-text">
            {t("owner.roomDetail.reminderTitle")}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {t("owner.reminder.timeline.legend")}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-rc-green/30 bg-rc-green-soft px-3 py-1 text-xs font-medium text-rc-green">
          {t("owner.followup.autoBadge")}
        </span>
      </div>

      <div className="mt-3 space-y-1 rounded-lg border border-zinc-100 bg-white px-3 py-2.5 text-sm text-zinc-700">
        <p>{lastIssuedLabel}</p>
        {nextBillLabel ? <p>{nextBillLabel}</p> : null}
      </div>

      {timeline ? (
        <div className="mt-4 space-y-2">
          {TIER_META.map(({ tier, icon: Icon, whenKey }) => {
            const status = timeline.steps[tier];
            const active = status === "ready" || status === "done";
            return (
              <div
                key={tier}
                className={`flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 ${stepRowClass(tier, status)}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? "" : "opacity-50"}`}
                  strokeWidth={2}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${active ? "" : "text-zinc-500"}`}>
                    {t(whenKey)}
                  </p>
                  <p className="text-xs opacity-80">{stepHint(tier, status)}</p>
                </div>
                {status === "done" ? (
                  <span className="text-sm font-semibold text-rc-green">✓</span>
                ) : status === "ready" ? (
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                    {t("owner.reminder.timeline.chipReadyLabel")}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : showSoftCountdown ? (
        <p className="mt-4 rounded-lg border border-zinc-100 bg-white px-3 py-3 text-sm text-zinc-700">
          {t("owner.reminder.availableInDays", {
            days: row.reminder_days_until_soft!,
          })}
        </p>
      ) : null}

      {summary && (
        <p
          className={`mt-3 text-sm ${
            timeline?.allTiersSent ? "font-medium text-amber-900" : "text-zinc-600"
          }`}
        >
          {summary.key === "owner.reminder.timeline.exhausted"
            ? t(summary.key)
            : summary.key === "owner.reminder.timeline.ready"
              ? t(summary.key, { tier: tierLabel(summary.params.tier) })
              : summary.key === "owner.reminder.timeline.sentWaiting"
                ? t(summary.key, {
                    tier: tierLabel(summary.params.tier),
                    days: summary.params.days,
                    nextTier: tierLabel(summary.params.nextTier),
                  })
                : t(summary.key, {
                    days: summary.params.days,
                    tier: tierLabel(summary.params.tier),
                  })}
        </p>
      )}

      {row.reminder_recommended && row.reminder_can_send ? (
        <button
          type="button"
          disabled={disabled || reminderDisabled || !canRemind}
          onClick={() => onRemind(row.tenant_id, row.reminder_recommended!)}
          className={`mt-4 flex min-h-12 w-full items-center justify-center rounded-lg border text-base font-medium disabled:cursor-not-allowed disabled:opacity-50 ${REMINDER_TIER_BUTTON_CLASS[row.reminder_recommended]}`}
        >
          <EasyModeCtaIcon name="remind" />
          {reminderDisabled
            ? t("owner.reminder.sending")
            : remindedTenantId === row.tenant_id
              ? t("owner.reminder.sent")
              : t(reminderTierMessageKey(row.reminder_recommended))}
        </button>
      ) : null}
    </section>
  );
}
