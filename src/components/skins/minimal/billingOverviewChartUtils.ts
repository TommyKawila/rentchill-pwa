import type { OverviewSegmentKey } from "@/services/billingOverviewService";

export const SEGMENT_COLORS: Record<
  OverviewSegmentKey,
  { bar: string; dot: string; stroke: string }
> = {
  notIssued: {
    bar: "bg-zinc-300",
    dot: "bg-zinc-400",
    stroke: "#a1a1aa",
  },
  paid: {
    bar: "bg-rc-success",
    dot: "bg-rc-success",
    stroke: "#22c55e",
  },
  unpaid: {
    bar: "bg-orange-500",
    dot: "bg-orange-500",
    stroke: "#ea580c",
  },
  scanning: {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    stroke: "#d97706",
  },
};

export const SEGMENT_LABEL_KEYS = {
  notIssued: "owner.overview.notIssued",
  paid: "owner.overview.paid",
  unpaid: "owner.overview.unpaid",
  scanning: "owner.overview.scanning",
} as const;

export const CHILL_COLORS = {
  bar: "bg-[var(--color-rc-green)]",
  dot: "bg-[var(--color-rc-green)]",
  stroke: "#32b04d",
} as const;
