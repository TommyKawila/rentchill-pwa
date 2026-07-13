"use client";

import { useLocale } from "@/components/LocaleProvider";
import { BillingOverviewBarSkin } from "@/components/skins/minimal/BillingOverviewBarSkin";
import { BillingOverviewGridSkin } from "@/components/skins/minimal/BillingOverviewGridSkin";
import { BillingOverviewPieSkin } from "@/components/skins/minimal/BillingOverviewPieSkin";
import { BillingOverviewViewToggle } from "@/components/skins/minimal/BillingOverviewViewToggle";
import { useOverviewView } from "@/hooks/useOverviewView";
import type { BillingOverview } from "@/services/billingOverviewService";

interface BillingOverviewSkinProps {
  billingMonth: string;
  overview: BillingOverview;
}

export function BillingOverviewSkin({
  billingMonth,
  overview,
}: BillingOverviewSkinProps) {
  const { t } = useLocale();
  const { view, setView } = useOverviewView();

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 font-medium tracking-tight text-zinc-500">
          {t("owner.overview.title", { month: billingMonth })}
        </p>
        <BillingOverviewViewToggle view={view} onChange={setView} />
      </div>

      <div className="mt-3">
        {view === "grid" && <BillingOverviewGridSkin overview={overview} />}
        {view === "pie" && <BillingOverviewPieSkin overview={overview} />}
        {view === "bar" && <BillingOverviewBarSkin overview={overview} />}
      </div>
    </div>
  );
}
