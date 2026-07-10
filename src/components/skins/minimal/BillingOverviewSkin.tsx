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
  { keys: ["total", "issued", "notIssued"] },
  {
    keys: ["paid", "unpaid", "scanning"],
    accents: {
      paid: "border-green-200 bg-green-50",
      scanning: "border-amber-200 bg-amber-50",
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
    <div>
      <p className="text-zinc-500">
        {t("owner.overview.title", { month: billingMonth })}
      </p>
      <div className="mt-3 space-y-3">
        {ROWS.map((row, index) => (
          <div key={index} className="grid grid-cols-3 gap-3">
            {row.keys.map((key) => (
              <div
                key={key}
                className={`rounded-xl border px-4 py-3 ${
                  row.accents?.[key] ?? "border-zinc-100 bg-white"
                }`}
              >
                <p className="text-zinc-500">{t(LABEL_KEYS[key])}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900">
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
