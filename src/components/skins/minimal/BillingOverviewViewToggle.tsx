"use client";

import { BarChart2, LayoutGrid, PieChart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { OverviewView } from "@/hooks/useOverviewView";

interface BillingOverviewViewToggleProps {
  view: OverviewView;
  onChange: (view: OverviewView) => void;
}

const OPTIONS: {
  view: OverviewView;
  icon: typeof LayoutGrid;
  labelKey: "owner.overview.view.grid" | "owner.overview.view.pie" | "owner.overview.view.bar";
  shortLabelKey:
    | "owner.overview.view.gridShort"
    | "owner.overview.view.pieShort"
    | "owner.overview.view.barShort";
}[] = [
  {
    view: "grid",
    icon: LayoutGrid,
    labelKey: "owner.overview.view.grid",
    shortLabelKey: "owner.overview.view.gridShort",
  },
  {
    view: "pie",
    icon: PieChart,
    labelKey: "owner.overview.view.pie",
    shortLabelKey: "owner.overview.view.pieShort",
  },
  {
    view: "bar",
    icon: BarChart2,
    labelKey: "owner.overview.view.bar",
    shortLabelKey: "owner.overview.view.barShort",
  },
];

export function BillingOverviewViewToggle({
  view,
  onChange,
}: BillingOverviewViewToggleProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = OPTIONS.find((o) => o.view === view) ?? OPTIONS[0];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass =
    "flex min-h-12 w-full items-center gap-x-3 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-zinc-50";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("owner.overview.viewMenu")}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-h-12 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900"
      >
        <ActiveIcon className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
        <span>{t(active.shortLabelKey)}</span>
        <span className="text-zinc-500" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("owner.overview.viewGroup")}
          className="absolute right-0 z-20 mt-1 min-w-[11rem] rounded-xl border border-zinc-100 bg-white p-1 shadow-sm"
        >
          {OPTIONS.map(({ view: optionView, icon: Icon, labelKey }) => {
            const selected = view === optionView;
            return (
              <button
                key={optionView}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(optionView);
                  setOpen(false);
                }}
                className={`${itemClass} ${selected ? "bg-zinc-50 text-zinc-900" : "text-zinc-700"}`}
              >
                <Icon className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={1.5} aria-hidden />
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
