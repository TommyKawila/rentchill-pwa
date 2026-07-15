"use client";

import { useLocale } from "@/components/LocaleProvider";
import { BillingOverviewBarSkin } from "@/components/skins/minimal/BillingOverviewBarSkin";
import { BillingOverviewGridSkin } from "@/components/skins/minimal/BillingOverviewGridSkin";
import { BillingOverviewPieSkin } from "@/components/skins/minimal/BillingOverviewPieSkin";
import { BillingOverviewViewToggle } from "@/components/skins/minimal/BillingOverviewViewToggle";
import { useBillingMonthDisplayFormat } from "@/hooks/useBillingMonthDisplayFormat";
import { useOverviewView } from "@/hooks/useOverviewView";
import type { BillingOverview } from "@/services/billingOverviewService";

interface BillingOverviewSkinProps {
  billingMonth: string;
  overview: BillingOverview;
  chillMode?: boolean;
}

export function BillingOverviewSkin({
  billingMonth,
  overview,
  chillMode = false,
}: BillingOverviewSkinProps) {
  const { t } = useLocale();
  const { view, setView } = useOverviewView();
  const { formatMonth } = useBillingMonthDisplayFormat();
  const displayMonth = formatMonth(billingMonth);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-sm sm:text-base">
          <span className="font-medium tracking-tight text-zinc-500">
            {t("owner.overview.billingLabel")}
          </span>
          <span className="font-semibold tracking-tight text-zinc-900">{displayMonth}</span>
        </p>
        <BillingOverviewViewToggle view={view} onChange={setView} />
      </div>

      <div className="mt-3">
        {view === "grid" && (
          <BillingOverviewGridSkin overview={overview} chillMode={chillMode} />
        )}
        {view === "pie" && (
          <BillingOverviewPieSkin overview={overview} chillMode={chillMode} />
        )}
        {view === "bar" && (
          <BillingOverviewBarSkin overview={overview} chillMode={chillMode} />
        )}
      </div>
    </div>
  );
}
