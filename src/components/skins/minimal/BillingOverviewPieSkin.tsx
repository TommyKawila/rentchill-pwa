"use client";

import { CircleCheck } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import {
  getOverviewSegments,
  getOverviewSummary,
  type BillingOverview,
  type OverviewSegmentKey,
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

const SIZE = 136;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 44;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * R;
const SEGMENT_GAP = 3;

function DonutChart({
  overview,
  chillMode,
}: {
  overview: BillingOverview;
  chillMode: boolean;
}) {
  const track = (
    <circle
      cx={CX}
      cy={CY}
      r={R}
      fill="none"
      stroke="#f4f4f5"
      strokeWidth={STROKE}
    />
  );

  if (overview.total === 0) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        {track}
      </svg>
    );
  }

  if (chillMode) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        {track}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={CHILL_COLORS.stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="drop-shadow-sm"
        />
      </svg>
    );
  }

  const segments = getOverviewSegments(overview).filter((s) => s.value > 0);
  let accumulated = 0;

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
      {track}
      {segments.map((seg) => {
        const dash = Math.max(0, seg.ratio * CIRCUMFERENCE - SEGMENT_GAP);
        const rotation = accumulated * 360 - 90 + SEGMENT_GAP / 2;
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
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            transform={`rotate(${rotation} ${CX} ${CY})`}
          />
        );
      })}
    </svg>
  );
}

function LegendRow({
  segmentKey,
  label,
  value,
}: {
  segmentKey: OverviewSegmentKey | "chill";
  label: string;
  value: number;
}) {
  const tone =
    segmentKey === "chill"
      ? CHILL_COLORS
      : SEGMENT_COLORS[segmentKey as OverviewSegmentKey];

  return (
    <li className="flex min-h-12 items-center gap-3 rounded-lg border border-zinc-100 bg-white px-3">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
      <span className="min-w-0 flex-1 truncate text-sm text-zinc-600">{label}</span>
      <span className="shrink-0 text-sm font-bold tabular-nums text-zinc-900">{value}</span>
    </li>
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
      <ul className="space-y-2">
        <LegendRow
          segmentKey="chill"
          label={t("owner.overview.chillBadge")}
          value={overview.total}
        />
        {overview.paid > 0 ? (
          <LegendRow
            segmentKey="paid"
            label={t(SEGMENT_LABEL_KEYS.paid)}
            value={overview.paid}
          />
        ) : null}
      </ul>
    );
  }

  const segments = getOverviewSegments(overview).filter((s) => s.value > 0);

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {segments.map((seg) => (
        <LegendRow
          key={seg.key}
          segmentKey={seg.key}
          label={t(SEGMENT_LABEL_KEYS[seg.key])}
          value={seg.value}
        />
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
      className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4"
      aria-label={summary || t("owner.overview.chartSummaryEmpty")}
    >
      {chillMode && overview.total > 0 ? (
        <span className="mb-3 inline-flex rounded-full border border-[var(--color-rc-green)]/30 bg-[var(--color-rc-green-soft)] px-3 py-1 text-sm font-medium text-[var(--color-rc-green)]">
          {t("owner.overview.chillBadge")}
        </span>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div className="absolute inset-3 rounded-full bg-white shadow-sm ring-1 ring-zinc-100" />
          <DonutChart overview={overview} chillMode={chillMode} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {chillMode && overview.total > 0 ? (
              <CircleCheck
                className="mb-0.5 h-6 w-6 text-[var(--color-rc-green)]"
                strokeWidth={2}
                aria-hidden
              />
            ) : null}
            <p className="text-2xl font-bold tabular-nums tracking-tight text-rc-text">
              {overview.total}
            </p>
            <p className="text-xs text-zinc-500">{t("owner.overview.centerTotal")}</p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <Legend overview={overview} chillMode={chillMode} />
        </div>
      </div>
    </div>
  );
}
