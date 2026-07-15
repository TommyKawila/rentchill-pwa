"use client";

import { useLocale } from "@/components/LocaleProvider";
import {
  getOverviewSegments,
  getOverviewSummary,
  type BillingOverview,
} from "@/services/billingOverviewService";
import {
  SEGMENT_COLORS,
  SEGMENT_LABEL_KEYS,
  CHILL_COLORS,
} from "@/components/skins/minimal/billingOverviewChartUtils";

interface BillingOverviewBarSkinProps {
  overview: BillingOverview;
  chillMode?: boolean;
}

export function BillingOverviewBarSkin({
  overview,
  chillMode = false,
}: BillingOverviewBarSkinProps) {
  const { t } = useLocale();
  const segments = getOverviewSegments(overview);
  const labels = {
    notIssued: t("owner.overview.notIssued"),
    paid: t("owner.overview.paid"),
    unpaid: t("owner.overview.unpaid"),
    scanning: t("owner.overview.scanning"),
  };
  const summary = chillMode
    ? t("owner.overview.chillBadge")
    : getOverviewSummary(overview, labels);

  if (chillMode && overview.total > 0) {
    return (
      <ul className="space-y-3" aria-label={summary}>
        <li className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-3">
          <span className="truncate text-sm font-medium text-[var(--color-rc-green)]">
            {t("owner.overview.chillBadge")}
          </span>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className={`h-full w-full rounded-full ${CHILL_COLORS.bar}`} />
          </div>
          <span className="text-right text-sm font-bold tabular-nums text-zinc-900">
            {overview.total}
          </span>
        </li>
      </ul>
    );
  }

  return (
    <ul
      className="space-y-3"
      aria-label={summary || t("owner.overview.chartSummaryEmpty")}
    >
      {segments.map((seg) => {
        const widthPct =
          overview.total > 0 ? Math.max(seg.ratio * 100, seg.value > 0 ? 4 : 0) : 0;

        return (
          <li key={seg.key} className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-3">
            <span className="truncate text-sm text-zinc-600">
              {t(SEGMENT_LABEL_KEYS[seg.key])}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full ${SEGMENT_COLORS[seg.key].bar}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="text-right text-sm font-bold tabular-nums text-zinc-900">
              {seg.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
