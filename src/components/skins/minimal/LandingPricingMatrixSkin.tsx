"use client";

import { Check, Minus } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import {
  matrixCellValue,
  PLAN_FEATURE_MATRIX_ROWS,
  PLAN_TIER_ORDER,
  PLAN_TIER_PRICES,
} from "@/services/planFeatureMatrix";
import type { PlanTier } from "@/services/planTierNormalize";

function CellIcon({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-xs font-semibold tabular-nums text-zinc-800">{value}</span>;
  }
  if (value) {
    return <Check className="mx-auto h-4 w-4 text-rc-green" strokeWidth={2.5} aria-hidden />;
  }
  return <Minus className="mx-auto h-4 w-4 text-zinc-300" strokeWidth={2} aria-hidden />;
}

export function LandingPricingMatrixSkin() {
  const { t } = useLocale();

  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-100">
      <table className="w-full min-w-[360px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50">
            <th className="px-4 py-3 text-left font-semibold text-zinc-700">
              {t("landing.pricing.matrix.featureCol")}
            </th>
            {PLAN_TIER_ORDER.map((tier) => (
              <th key={tier} className="px-3 py-3 text-center font-semibold text-zinc-900">
                <div>{t(`owner.plan.tier.${tier}`)}</div>
                <div className="mt-0.5 text-xs font-normal text-zinc-500">
                  {PLAN_TIER_PRICES[tier] === 0
                    ? t("landing.pricing.free")
                    : t("landing.pricing.perMonth", {
                        price: String(PLAN_TIER_PRICES[tier]),
                      })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_FEATURE_MATRIX_ROWS.map((row) => (
            <tr key={row.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2.5 text-zinc-700">
                {t(`landing.pricing.matrix.${row.id}` as never)}
              </td>
              {PLAN_TIER_ORDER.map((tier) => (
                <td key={tier} className="px-3 py-2.5 text-center">
                  <CellIcon value={matrixCellValue(row.id, tier as PlanTier)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
