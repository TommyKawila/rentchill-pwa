"use client";

import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CircleCheck,
  CircleAlert,
  FileCheck,
  FileX,
  ScanSearch,
} from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import type { BillingOverview } from "@/services/billingOverviewService";

interface BillingOverviewGridSkinProps {
  overview: BillingOverview;
  chillMode?: boolean;
}

type StatKey = keyof BillingOverview;

type StatDef = {
  key: StatKey;
  icon: LucideIcon;
  accent?: "paid" | "unpaid" | "scanning";
};

const PIPELINE: StatDef[] = [
  { key: "total", icon: Building2 },
  { key: "issued", icon: FileCheck },
  { key: "notIssued", icon: FileX },
];

const PAYMENT: StatDef[] = [
  { key: "paid", icon: CircleCheck, accent: "paid" },
  { key: "unpaid", icon: CircleAlert, accent: "unpaid" },
  { key: "scanning", icon: ScanSearch, accent: "scanning" },
];

const LABEL_KEYS = {
  total: "owner.overview.total",
  issued: "owner.overview.issued",
  notIssued: "owner.overview.notIssued",
  paid: "owner.overview.paid",
  unpaid: "owner.overview.unpaid",
  scanning: "owner.overview.scanning",
} as const satisfies Record<StatKey, MessageKey>;

function cellTone(
  accent: StatDef["accent"],
  value: number,
  key: StatKey,
  chillMode: boolean,
) {
  if (chillMode && key === "issued" && value > 0) {
    return {
      cell: "border-[var(--color-rc-green)]/30 bg-[var(--color-rc-green-soft)]",
      icon: "text-[var(--color-rc-green)]",
      value: "text-zinc-900",
    };
  }
  if (chillMode && key === "notIssued") {
    return {
      cell: "border-[var(--color-rc-green)]/20 bg-[var(--color-rc-green-soft)]",
      icon: "text-[var(--color-rc-green)]",
      value: "text-zinc-900",
    };
  }
  if (accent === "paid") {
    return {
      cell: "border-green-200 bg-green-50",
      icon: "text-green-600",
      value: "text-zinc-900",
    };
  }
  if (accent === "unpaid" && value > 0) {
    return {
      cell: "border-orange-200 bg-orange-50",
      icon: "text-orange-600",
      value: "text-zinc-900",
    };
  }
  if (accent === "scanning" && value > 0) {
    return {
      cell: "border-amber-200 bg-amber-50",
      icon: "text-amber-700",
      value: "text-zinc-900",
    };
  }
  return {
    cell: "border-zinc-100 bg-white",
    icon: "text-zinc-500",
    value: "text-zinc-900",
  };
}

function StatCell({
  def,
  value,
  label,
  chillMode,
}: {
  def: StatDef;
  value: number;
  label: string;
  chillMode: boolean;
}) {
  const Icon = def.icon;
  const tone = cellTone(def.accent, value, def.key, chillMode);

  return (
    <div className={`rounded-xl border px-3 py-3 ${tone.cell}`}>
      <div className="flex items-center gap-x-2">
        <Icon
          className={`h-5 w-5 shrink-0 ${tone.icon}`}
          strokeWidth={1.5}
          aria-hidden
        />
        <p className={`text-2xl font-bold tabular-nums tracking-tight ${tone.value}`}>
          {value}
        </p>
      </div>
      <p className="mt-1.5 text-sm leading-snug text-zinc-500">{label}</p>
    </div>
  );
}

function StatRow({
  defs,
  overview,
  t,
  chillMode,
}: {
  defs: StatDef[];
  overview: BillingOverview;
  t: (key: MessageKey) => string;
  chillMode: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {defs.map((def) => (
        <StatCell
          key={def.key}
          def={def}
          value={overview[def.key]}
          label={t(LABEL_KEYS[def.key])}
          chillMode={chillMode}
        />
      ))}
    </div>
  );
}

export function BillingOverviewGridSkin({
  overview,
  chillMode = false,
}: BillingOverviewGridSkinProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      {chillMode && (
        <span className="inline-flex rounded-full border border-[var(--color-rc-green)]/30 bg-[var(--color-rc-green-soft)] px-3 py-1 text-sm font-medium text-[var(--color-rc-green)]">
          {t("owner.overview.chillBadge")}
        </span>
      )}
      <StatRow defs={PIPELINE} overview={overview} t={t} chillMode={chillMode} />
      <div className="border-t border-zinc-100 pt-3">
        <StatRow defs={PAYMENT} overview={overview} t={t} chillMode={chillMode} />
      </div>
    </div>
  );
}
