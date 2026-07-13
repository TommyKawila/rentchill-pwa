"use client";

import { BarChart2, LayoutGrid, PieChart } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { OverviewView } from "@/hooks/useOverviewView";

interface BillingOverviewViewToggleProps {
  view: OverviewView;
  onChange: (view: OverviewView) => void;
}

const OPTIONS: { view: OverviewView; icon: typeof LayoutGrid; labelKey: "owner.overview.view.grid" | "owner.overview.view.pie" | "owner.overview.view.bar" }[] = [
  { view: "grid", icon: LayoutGrid, labelKey: "owner.overview.view.grid" },
  { view: "pie", icon: PieChart, labelKey: "owner.overview.view.pie" },
  { view: "bar", icon: BarChart2, labelKey: "owner.overview.view.bar" },
];

export function BillingOverviewViewToggle({
  view,
  onChange,
}: BillingOverviewViewToggleProps) {
  const { t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("owner.overview.viewGroup")}
      className="flex shrink-0 rounded-lg border border-zinc-200 bg-white p-0.5"
    >
      {OPTIONS.map(({ view: optionView, icon: Icon, labelKey }) => {
        const active = view === optionView;
        return (
          <button
            key={optionView}
            type="button"
            aria-pressed={active}
            aria-label={t(labelKey)}
            title={t(labelKey)}
            onClick={() => onChange(optionView)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
