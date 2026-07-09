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
  showSlug?: boolean;
}

export function ProjectSelectorSkin({
  properties,
  value,
  loading,
  onChange,
  onAddClick,
  addDisabled,
  showSlug = true,
}: ProjectSelectorSkinProps) {
  const { t } = useLocale();
  const activeProperty =
    properties.find((property) => property.slug === value) ?? null;

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
            {properties.length === 0 && (
              <option value={value}>{value}</option>
            )}
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
              className="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-lg font-medium leading-none text-zinc-700 disabled:opacity-50"
            >
              +
            </button>
          )}
        </div>
      </label>
      {showSlug && activeProperty && (
        <p className="mt-1 text-xs text-zinc-500">/{activeProperty.slug}</p>
      )}
    </div>
  );
}
