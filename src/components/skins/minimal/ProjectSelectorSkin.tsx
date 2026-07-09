"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface ProjectSelectorSkinProps {
  properties: OwnerPropertyOption[];
  value: string;
  loading?: boolean;
  onChange: (slug: string) => void;
  onAddClick?: () => void;
  addDisabled?: boolean;
}

export function ProjectSelectorSkin({
  properties,
  value,
  loading,
  onChange,
  onAddClick,
  addDisabled,
}: ProjectSelectorSkinProps) {
  const { t } = useLocale();
  const isEmpty = !loading && properties.length === 0;

  if (isEmpty && onAddClick) {
    return (
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium text-zinc-900">
          {t("owner.noProjectTitle")}
        </p>
        <p className="mt-1 text-xs text-zinc-500">{t("owner.noProjectHint")}</p>
        <button
          type="button"
          disabled={addDisabled}
          onClick={onAddClick}
          className="mt-3 w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.addProject")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <label className="block space-y-1 text-sm">
        <span className="text-zinc-500">{t("owner.selectProject")}</span>
        <div className="flex gap-2">
          <select
            value={value}
            disabled={loading || properties.length === 0}
            onChange={(event) => onChange(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 disabled:bg-zinc-100"
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
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +
            </button>
          )}
        </div>
      </label>
    </div>
  );
}
