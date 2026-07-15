"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import type { ReminderTier } from "@/services/paymentReminderTier";
import type { UnpaidReminderSummary } from "@/services/unpaidReminderSummaryService";

interface RentFollowUpStatusSkinProps {
  summary: UnpaidReminderSummary;
  propertySlug: string;
}

function StatRow({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold tabular-nums text-zinc-900">{count}</span>
      <span className="text-base text-zinc-700">{label}</span>
    </div>
  );
}

const TIER_CHIP: Record<ReminderTier, string> = {
  soft: "border-rc-green/30 bg-rc-green-soft text-zinc-900",
  firm: "border-amber-200 bg-amber-50 text-amber-900",
  final: "border-red-200 bg-red-50 text-red-700",
};

export function RentFollowUpStatusSkin({
  summary,
  propertySlug,
}: RentFollowUpStatusSkinProps) {
  const { t } = useLocale();

  if (summary.unpaid <= 0) return null;

  const tierLabel = (tier: ReminderTier) => {
    if (tier === "soft") return t("owner.reminder.tier.soft");
    if (tier === "firm") return t("owner.reminder.tier.firm");
    return t("owner.reminder.tier.final");
  };

  const readyTotal =
    summary.readyByTier.soft +
    summary.readyByTier.firm +
    summary.readyByTier.final;

  const waitingTotal = summary.waitingForDays + summary.awaitingNextTier;
  const dashboardBase = `/dashboard?property=${encodeURIComponent(propertySlug)}`;

  return (
    <section className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
      <div className="space-y-1 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-zinc-900">
            {t("owner.followup.title")}
          </h2>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rc-green/30 bg-rc-green-soft px-3 py-1 text-sm font-medium text-rc-green-ink">
            <span className="h-2 w-2 rounded-full bg-rc-green" aria-hidden />
            {t("owner.followup.autoBadge")}
          </span>
        </div>
        <p className="text-sm text-zinc-500">{t("owner.followup.autoHint")}</p>
      </div>

      <div className="space-y-4 px-6 py-4">
        <StatRow count={summary.unpaid} label={t("owner.command.unpaidStat")} />

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-500">
            {t("owner.followup.readyToday")}
          </p>
          <div className="flex flex-wrap gap-2">
            {(["soft", "firm", "final"] as ReminderTier[]).map((tier) => (
              <span
                key={tier}
                className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-medium ${TIER_CHIP[tier]}`}
              >
                {t("owner.followup.tierChip", {
                  tier: tierLabel(tier),
                  count: summary.readyByTier[tier],
                })}
              </span>
            ))}
          </div>
        </div>

        {readyTotal === 0 && (
          <p className="text-sm text-zinc-500">
            {t("owner.followup.contextWaiting", {
              waiting: waitingTotal,
              noLine: summary.noLine,
            })}
          </p>
        )}

        <Link
          href={`${dashboardBase}#billing-unpaid`}
          className="inline-block text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          {t("owner.followup.viewUnpaid")} →
        </Link>
      </div>
    </section>
  );
}
