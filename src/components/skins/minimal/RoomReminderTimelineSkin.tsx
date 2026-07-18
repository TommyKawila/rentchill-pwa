"use client";

import { useLocale } from "@/components/LocaleProvider";
import {
  REMINDER_TIER_ORDER,
  type ReminderDaySettings,
  type ReminderStepStatus,
  type ReminderTier,
  type ReminderTimeline,
} from "@/services/paymentReminderTier";

interface RoomReminderTimelineSkinProps {
  timeline: ReminderTimeline;
  tierSent: ReminderTier | null;
  settings: ReminderDaySettings;
}

const TIER_CHIP_CLASS: Record<
  ReminderTier,
  Record<ReminderStepStatus, string>
> = {
  soft: {
    done: "border-rc-green/30 bg-rc-green-soft text-rc-green-ink",
    ready: "border-rc-green bg-rc-green text-white",
    countdown: "border-rc-green/40 bg-white text-rc-green-ink",
    upcoming: "border-zinc-100 bg-zinc-50 text-zinc-400",
  },
  firm: {
    done: "border-amber-200 bg-amber-50 text-amber-900",
    ready: "border-amber-400 bg-amber-100 text-amber-900",
    countdown: "border-amber-300 bg-white text-amber-900",
    upcoming: "border-zinc-100 bg-zinc-50 text-zinc-400",
  },
  final: {
    done: "border-red-200 bg-red-50 text-red-700",
    ready: "border-red-300 bg-red-50 text-red-700",
    countdown: "border-red-200 bg-white text-red-700",
    upcoming: "border-zinc-100 bg-zinc-50 text-zinc-400",
  },
};

function tierDayLabel(tier: ReminderTier, settings: ReminderDaySettings) {
  if (tier === "soft") return `−${settings.soft}`;
  if (tier === "firm") return `+${settings.firm}`;
  return `+${settings.final}`;
}

function timelineTierKey(
  tier: ReminderTier,
):
  | "owner.reminder.timeline.tierSoft"
  | "owner.reminder.timeline.tierFirm"
  | "owner.reminder.timeline.tierFinal" {
  if (tier === "soft") return "owner.reminder.timeline.tierSoft";
  if (tier === "firm") return "owner.reminder.timeline.tierFirm";
  return "owner.reminder.timeline.tierFinal";
}

function buildSummary(timeline: ReminderTimeline, tierSent: ReminderTier | null) {
  if (timeline.allTiersSent) {
    return { key: "owner.reminder.timeline.exhausted" as const, params: {} };
  }

  const nextTier = timeline.nextTier;
  if (!nextTier) return null;

  if (timeline.daysUntilNext === null) {
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

export function RoomReminderTimelineSkin({
  timeline,
  tierSent,
  settings,
}: RoomReminderTimelineSkinProps) {
  const { t } = useLocale();
  const summary = buildSummary(timeline, tierSent);

  const tierLabel = (tier: ReminderTier) => t(timelineTierKey(tier));

  const chipText = (tier: ReminderTier, status: ReminderStepStatus) => {
    const name = tierLabel(tier);
    if (status === "done") {
      return `${name} · ${t("owner.reminder.timeline.chipDoneLabel")} ✓`;
    }
    if (status === "ready") {
      return `${name} · ${t("owner.reminder.timeline.chipReadyLabel")}`;
    }
    return t("owner.reminder.timeline.chipScheduled", {
      tier: name,
      day: tierDayLabel(tier, settings),
    });
  };

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {REMINDER_TIER_ORDER.map((tier) => {
          const status = timeline.steps[tier];
          return (
            <span
              key={tier}
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${TIER_CHIP_CLASS[tier][status]}`}
            >
              {chipText(tier, status)}
            </span>
          );
        })}
      </div>
      {summary && (
        <p className="text-sm text-zinc-600">
          {summary.key === "owner.reminder.timeline.exhausted"
            ? t(summary.key)
            : summary.key === "owner.reminder.timeline.ready"
              ? t(summary.key, {
                  tier: tierLabel(summary.params.tier),
                })
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
    </div>
  );
}
