"use client";

import { Building2 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface ProjectSelectorSkinProps {
  properties: OwnerPropertyOption[];
  value: string;
  loading?: boolean;
  onChange: (slug: string) => void;
  onAddClick?: () => void;
  addDisabled?: boolean;
  /** stack = full-width under title (settings); inline = compact beside title; chip = pill on dashboard */
  layout?: "stack" | "inline" | "chip";
}

export function ProjectSelectorSkin({
  properties,
  value,
  loading,
  onChange,
  onAddClick,
  addDisabled,
  layout = "stack",
}: ProjectSelectorSkinProps) {
  const { t } = useLocale();
  const isEmpty = !loading && properties.length === 0;
  const isInline = layout === "inline";
  const isChip = layout === "chip";

  if (isEmpty && onAddClick) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="font-medium text-zinc-900">{t("owner.noProjectTitle")}</p>
        <p className="mt-1 text-zinc-500">{t("owner.noProjectHint")}</p>
        <button
          type="button"
          disabled={addDisabled}
          onClick={onAddClick}
          className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.addProject")}
        </button>
      </div>
    );
  }

  return (
    <div className={isInline || isChip ? "w-full" : "mt-3"}>
      {isChip ? (
        <div className="flex items-center gap-2">
          <label className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-2xl border border-zinc-200 bg-white py-1.5 pl-2 pr-3 shadow-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rc-green text-white">
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            </span>
            <select
              value={value}
              disabled={loading || properties.length === 0}
              onChange={(event) => onChange(event.target.value)}
              aria-label={t("owner.selectProject")}
              className="max-w-[220px] truncate border-0 bg-transparent py-1 text-xs font-bold text-rc-text outline-none disabled:text-zinc-400"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.slug}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>
          {onAddClick ? (
            <button
              type="button"
              disabled={addDisabled || loading}
              onClick={onAddClick}
              aria-label={t("owner.addProject")}
              title={t("owner.addProject")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-base font-medium text-zinc-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              +
            </button>
          ) : null}
        </div>
      ) : isInline ? (
        <label className="flex min-h-12 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3">
          <Building2
            className="h-4 w-4 shrink-0 text-zinc-400"
            strokeWidth={1.5}
            aria-hidden
          />
          <select
            value={value}
            disabled={loading || properties.length === 0}
            onChange={(event) => onChange(event.target.value)}
            aria-label={t("owner.selectProject")}
            className="min-w-0 flex-1 truncate border-0 bg-transparent py-2 text-base font-medium text-zinc-900 outline-none disabled:text-zinc-400"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.slug}>
                {property.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="block space-y-1">
          <span className="flex items-center gap-x-2 text-zinc-500">
            <Building2
              className="h-4 w-4 shrink-0 text-zinc-500"
              strokeWidth={1.5}
              aria-hidden
            />
            {t("owner.selectProject")}
          </span>
          <div className="flex gap-2">
            <select
              value={value}
              disabled={loading || properties.length === 0}
              onChange={(event) => onChange(event.target.value)}
              className="min-h-12 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base disabled:bg-zinc-100"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.slug}>
                  {property.name}
                </option>
              ))}
            </select>
            {onAddClick && (
              <button
                type="button"
                disabled={addDisabled || loading}
                onClick={onAddClick}
                aria-label={t("owner.addProject")}
                title={t("owner.addProject")}
                className="flex min-h-12 shrink-0 items-center rounded-lg border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
