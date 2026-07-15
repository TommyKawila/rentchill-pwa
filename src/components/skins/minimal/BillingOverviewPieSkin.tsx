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

interface BillingOverviewPieSkinProps {
  overview: BillingOverview;
  chillMode?: boolean;
}

const SIZE = 120;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 40;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * R;

function DonutChart({
  overview,
  chillMode,
}: {
  overview: BillingOverview;
  chillMode: boolean;
}) {
  if (overview.total === 0) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={STROKE}
        />
      </svg>
    );
  }

  if (chillMode) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={CHILL_COLORS.stroke}
          strokeWidth={STROKE}
        />
      </svg>
    );
  }

  const segments = getOverviewSegments(overview).filter((s) => s.value > 0);

  let accumulated = 0;

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
      {segments.map((seg) => {
        const dash = seg.ratio * CIRCUMFERENCE;
        const rotation = accumulated * 360 - 90;
        accumulated += seg.ratio;

        return (
          <circle
            key={seg.key}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={SEGMENT_COLORS[seg.key].stroke}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            transform={`rotate(${rotation} ${CX} ${CY})`}
          />
        );
      })}
    </svg>
  );
}

function Legend({
  overview,
  chillMode,
}: {
  overview: BillingOverview;
  chillMode: boolean;
}) {
  const { t } = useLocale();

  if (chillMode && overview.total > 0) {
    return (
      <ul className="grid grid-cols-1 gap-y-3 text-sm text-zinc-600">
        <li className="flex items-center gap-1.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${CHILL_COLORS.dot}`} />
          <span className="min-w-0 truncate font-medium text-[var(--color-rc-green)]">
            {t("owner.overview.chillBadge")}
          </span>
          <span className="ml-auto tabular-nums font-medium text-zinc-900">
            {overview.total}
          </span>
        </li>
      </ul>
    );
  }

  const segments = getOverviewSegments(overview);

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm text-zinc-600">
      {segments.map((seg) => (
        <li key={seg.key} className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${SEGMENT_COLORS[seg.key].dot}`}
          />
          <span className="min-w-0 truncate">{t(SEGMENT_LABEL_KEYS[seg.key])}</span>
          <span className="ml-auto tabular-nums font-medium text-zinc-900">
            {seg.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BillingOverviewPieSkin({
  overview,
  chillMode = false,
}: BillingOverviewPieSkinProps) {
  const { t } = useLocale();
  const labels = {
    notIssued: t("owner.overview.notIssued"),
    paid: t("owner.overview.paid"),
    unpaid: t("owner.overview.unpaid"),
    scanning: t("owner.overview.scanning"),
  };
  const summary = chillMode
    ? t("owner.overview.chillBadge")
    : getOverviewSummary(overview, labels);

  return (
    <div
      className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6"
      aria-label={summary || t("owner.overview.chartSummaryEmpty")}
    >
      <div className="relative shrink-0">
        <DonutChart overview={overview} chillMode={chillMode} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-zinc-900">
            {overview.total}
          </p>
          <p className="text-sm text-zinc-500">{t("owner.overview.centerTotal")}</p>
        </div>
      </div>
      <div className="w-full min-w-0 sm:flex-1">
        <Legend overview={overview} chillMode={chillMode} />
      </div>
    </div>
  );
}
