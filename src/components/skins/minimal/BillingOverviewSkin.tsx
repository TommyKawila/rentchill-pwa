"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/services/i18n/messages";
import type { BillingOverview } from "@/services/billingOverviewService";

interface BillingOverviewSkinProps {
  billingMonth: string;
  overview: BillingOverview;
}

type StatKey = keyof BillingOverview;

const ROWS: { keys: StatKey[]; accents?: Partial<Record<StatKey, string>> }[] = [
  {
    keys: ["total", "issued", "notIssued"],
  },
  {
    keys: ["paid", "unpaid", "scanning"],
    accents: {
      paid: "border-green-200 bg-green-50/60",
      scanning: "border-amber-200 bg-amber-50/60",
    },
  },
];

const LABEL_KEYS = {
  total: "owner.overview.total",
  issued: "owner.overview.issued",
  notIssued: "owner.overview.notIssued",
  paid: "owner.overview.paid",
  unpaid: "owner.overview.unpaid",
  scanning: "owner.overview.scanning",
} as const satisfies Record<StatKey, MessageKey>;

export function BillingOverviewSkin({
  billingMonth,
  overview,
}: BillingOverviewSkinProps) {
  const { t } = useLocale();

  return (
    <div className="mt-4">
      <p className="text-xs text-zinc-500">
        {t("owner.overview.title", { month: billingMonth })}
      </p>
      <div className="mt-2 space-y-2">
        {ROWS.map((row, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            {row.keys.map((key) => (
              <div
                key={key}
                className={`rounded-lg border px-3 py-2.5 ${
                  row.accents?.[key] ?? "border-zinc-200 bg-white"
                }`}
              >
                <p className="text-[11px] text-zinc-500">{t(LABEL_KEYS[key])}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-zinc-900">
                  {overview[key]}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
