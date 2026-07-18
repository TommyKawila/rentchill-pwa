"use client";

import Link from "next/link";
import { AlertTriangle, Bell, TriangleAlert } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { ReminderTier } from "@/services/paymentReminderTier";
import type { UnpaidReminderSummary } from "@/services/unpaidReminderSummaryService";
import { REMINDER_TIER_BUTTON_CLASS } from "@/services/reminderUi";

interface RentFollowUpStatusSkinProps {
  summary: UnpaidReminderSummary;
  propertySlug: string;
}

const TIERS: {
  tier: ReminderTier;
  icon: typeof Bell;
  whenKey:
    | "owner.reminder.timeline.tierSoft"
    | "owner.reminder.timeline.tierFirm"
    | "owner.reminder.timeline.tierFinal";
}[] = [
  { tier: "final", icon: TriangleAlert, whenKey: "owner.reminder.timeline.tierFinal" },
  { tier: "firm", icon: AlertTriangle, whenKey: "owner.reminder.timeline.tierFirm" },
  { tier: "soft", icon: Bell, whenKey: "owner.reminder.timeline.tierSoft" },
];

export function RentFollowUpStatusSkin({
  summary,
  propertySlug,
}: RentFollowUpStatusSkinProps) {
  const { t } = useLocale();

  if (summary.unpaid <= 0) return null;

  const readyTotal =
    summary.readyByTier.soft +
    summary.readyByTier.firm +
    summary.readyByTier.final;
  const pendingTotal = Math.max(0, summary.unpaid - readyTotal);
  const dashboardBase = `/dashboard?property=${encodeURIComponent(propertySlug)}`;

  return (
    <section className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-rc-text">{t("owner.followup.title")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("owner.followup.autoHint")}</p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full border border-rc-green/30 bg-rc-green-soft px-3 py-1 text-xs font-medium text-rc-green">
          {t("owner.followup.autoBadge")}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-4">
        <p className="text-3xl font-bold tabular-nums tracking-tight text-amber-950">
          {summary.unpaid}
        </p>
        <p className="mt-1 text-sm font-medium text-amber-900">
          {t("owner.command.unpaidStat")}
        </p>
        <p className="mt-2 text-sm text-amber-800/90">
          {t("owner.followup.summaryLine", {
            ready: readyTotal,
            pending: pendingTotal,
          })}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-zinc-700">{t("owner.followup.readyToday")}</p>
        {TIERS.map(({ tier, icon: Icon, whenKey }) => {
          const count = summary.readyByTier[tier];
          const active = count > 0;
          return (
            <div
              key={tier}
              className={`flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 ${
                active
                  ? REMINDER_TIER_BUTTON_CLASS[tier]
                  : "border-zinc-100 bg-white text-zinc-400"
              }`}
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
                {active ? (
                  <p className="text-xs opacity-80">{t("owner.followup.tierActionHint")}</p>
                ) : null}
              </div>
              <span
                className={`text-xl font-bold tabular-nums ${active ? "" : "text-zinc-400"}`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {(summary.noLine > 0 || (readyTotal === 0 && pendingTotal > 0)) && (
        <p className="mt-3 text-sm text-zinc-500">
          {readyTotal === 0
            ? t("owner.followup.contextWaiting", {
                waiting: summary.waitingForDays + summary.awaitingNextTier,
                noLine: summary.noLine,
              })
            : summary.noLine > 0
              ? t("owner.followup.noLineNote", { count: summary.noLine })
              : null}
        </p>
      )}

      <Link
        href={`${dashboardBase}#billing-unpaid`}
        className="mt-4 flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 hover:bg-zinc-50"
      >
        {t("owner.followup.viewUnpaid")} →
      </Link>
    </section>
  );
}
