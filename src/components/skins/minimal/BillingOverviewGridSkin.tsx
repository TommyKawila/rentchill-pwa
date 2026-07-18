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
  role: "total" | "issued" | "notIssued" | "paid" | "unpaid" | "scanning";
};

const PIPELINE: StatDef[] = [
  { key: "total", icon: Building2, role: "total" },
  { key: "issued", icon: FileCheck, role: "issued" },
  { key: "notIssued", icon: FileX, role: "notIssued" },
];

const PAYMENT: StatDef[] = [
  { key: "paid", icon: CircleCheck, role: "paid" },
  { key: "unpaid", icon: CircleAlert, role: "unpaid" },
  { key: "scanning", icon: ScanSearch, role: "scanning" },
];

const LABEL_KEYS = {
  total: "owner.overview.total",
  issued: "owner.overview.issued",
  notIssued: "owner.overview.notIssued",
  paid: "owner.overview.paid",
  unpaid: "owner.overview.unpaid",
  scanning: "owner.overview.scanning",
} as const satisfies Record<StatKey, MessageKey>;

function cellTone(role: StatDef["role"], value: number, chillMode: boolean) {
  const neutral = {
    cell: "border-zinc-100 bg-white",
    iconWrap: "bg-zinc-100 text-zinc-500",
    value: "text-zinc-900",
  };

  if (value <= 0 && role !== "total") {
    return neutral;
  }

  switch (role) {
    case "total":
      return {
        cell: "border-zinc-100 bg-white",
        iconWrap: "bg-rc-primary-soft text-rc-primary",
        value: "text-rc-text",
      };
    case "issued":
      return chillMode
        ? {
            cell: "border-rc-green/30 bg-rc-green-soft",
            iconWrap: "bg-rc-green text-white",
            value: "text-rc-green-ink",
          }
        : {
            cell: "border-rc-green/20 bg-white",
            iconWrap: "bg-rc-green-soft text-rc-green",
            value: "text-zinc-900",
          };
    case "notIssued":
      return {
        cell: "border-zinc-200 bg-zinc-50",
        iconWrap: "bg-zinc-200 text-zinc-600",
        value: "text-zinc-900",
      };
    case "paid":
      return {
        cell: "border-rc-success/30 bg-rc-success-soft",
        iconWrap: "bg-rc-success text-white",
        value: "text-rc-success-ink",
      };
    case "unpaid":
      return {
        cell: "border-rc-warning/30 bg-amber-50",
        iconWrap: "bg-rc-warning text-white",
        value: "text-amber-900",
      };
    case "scanning":
      return {
        cell: "border-amber-200 bg-amber-50",
        iconWrap: "bg-amber-500 text-white",
        value: "text-amber-900",
      };
    default:
      return neutral;
  }
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
  const tone = cellTone(def.role, value, chillMode);

  return (
    <div className={`rounded-xl border px-3 py-3 ${tone.cell}`}>
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.iconWrap}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <p className={`text-2xl font-bold tabular-nums tracking-tight ${tone.value}`}>
          {value}
        </p>
      </div>
      <p className="mt-2 text-sm leading-snug text-zinc-500">{label}</p>
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
    <div className="grid grid-cols-3 gap-2.5">
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
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
      {chillMode ? (
        <span className="mb-3 inline-flex rounded-full border border-rc-green/30 bg-rc-green-soft px-3 py-1 text-sm font-medium text-rc-green">
          {t("owner.overview.chillBadge")}
        </span>
      ) : null}

      <div className="space-y-3">
        <StatRow defs={PIPELINE} overview={overview} t={t} chillMode={chillMode} />
        <div className="border-t border-zinc-100 pt-3">
          <StatRow defs={PAYMENT} overview={overview} t={t} chillMode={chillMode} />
        </div>
      </div>
    </div>
  );
}
