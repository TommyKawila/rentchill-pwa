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
} from "@/components/skins/minimal/billingOverviewChartUtils";

interface BillingOverviewBarSkinProps {
  overview: BillingOverview;
}

export function BillingOverviewBarSkin({ overview }: BillingOverviewBarSkinProps) {
  const { t } = useLocale();
  const segments = getOverviewSegments(overview);
  const labels = {
    notIssued: t("owner.overview.notIssued"),
    paid: t("owner.overview.paid"),
    unpaid: t("owner.overview.unpaid"),
    scanning: t("owner.overview.scanning"),
  };
  const summary = getOverviewSummary(overview, labels);

  return (
    <ul
      className="space-y-2.5"
      aria-label={summary || t("owner.overview.chartSummaryEmpty")}
    >
      {segments.map((seg) => {
        const widthPct =
          overview.total > 0 ? Math.max(seg.ratio * 100, seg.value > 0 ? 4 : 0) : 0;

        return (
          <li key={seg.key} className="grid grid-cols-[5.5rem_1fr_1.5rem] items-center gap-2">
            <span className="truncate text-xs text-zinc-600">
              {t(SEGMENT_LABEL_KEYS[seg.key])}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full ${SEGMENT_COLORS[seg.key].bar}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
            <span className="text-right text-xs font-medium tabular-nums text-zinc-900">
              {seg.value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
