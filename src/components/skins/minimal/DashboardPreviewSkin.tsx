"use client";

import { useLocale } from "@/components/LocaleProvider";

export function DashboardPreviewSkin() {
  const { t } = useLocale();

  const stats = [
    { label: t("owner.overview.total"), value: "12" },
    { label: t("owner.overview.issued"), value: "10" },
    { label: t("owner.overview.paid"), value: "8", accent: true },
    { label: t("owner.overview.unpaid"), value: "2" },
  ];

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-green-600">
        {t("landing.preview.tag")}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">
        {t("landing.preview.title")}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg border px-3 py-3 ${
              stat.accent
                ? "border-green-200 bg-green-50/60"
                : "border-zinc-100 bg-zinc-50"
            }`}
          >
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
        {["101", "102", "103"].map((room) => (
          <div
            key={room}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="font-medium text-zinc-900">
              {t("common.room", { number: room })}
            </span>
            <span className="text-green-600">{t("landing.preview.paid")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
