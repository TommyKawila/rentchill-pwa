"use client";

import { useRef, useState } from "react";
import { Camera, Send } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { MaintenanceTicketCategory } from "@/services/types";

interface TenantMaintenanceFormSkinProps {
  disabled?: boolean;
  submitting?: boolean;
  success?: boolean;
  fieldErrors?: {
    category?: string;
    description?: string;
    photo?: string;
  };
  onSubmit: (input: {
    category: MaintenanceTicketCategory | "";
    description: string;
    photo: File | null;
  }) => void;
  onSubmitAnother?: () => void;
}

const CATEGORIES: MaintenanceTicketCategory[] = [
  "ac",
  "plumbing",
  "electrical",
  "other",
];

const CATEGORY_KEYS = {
  ac: "tenant.maintenance.category.ac",
  plumbing: "tenant.maintenance.category.plumbing",
  electrical: "tenant.maintenance.category.electrical",
  other: "tenant.maintenance.category.other",
} as const;

export function TenantMaintenanceFormSkin({
  disabled,
  submitting,
  success,
  fieldErrors,
  onSubmit,
  onSubmitAnother,
}: TenantMaintenanceFormSkinProps) {
  const { t } = useLocale();
  const photoRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<MaintenanceTicketCategory | "">("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (success) {
    return (
      <section className="border-t border-zinc-100 bg-white p-6 text-center">
        <p className="text-base font-medium text-green-700">
          {t("tenant.maintenance.success")}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{t("tenant.maintenance.successHint")}</p>
        {onSubmitAnother && (
          <button
            type="button"
            onClick={onSubmitAnother}
            className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900"
          >
            {t("tenant.maintenance.submitAnother")}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="border-t border-zinc-100 bg-white p-6">
      <h2 className="text-base font-semibold text-zinc-900">
        {t("tenant.maintenance.title")}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">{t("tenant.maintenance.desc")}</p>

      <div className="mt-4 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-900">
            {t("tenant.maintenance.categoryLabel")}
          </span>
          <select
            value={category}
            disabled={disabled || submitting}
            onChange={(event) =>
              setCategory(event.target.value as MaintenanceTicketCategory | "")
            }
            className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-900"
          >
            <option value="">{t("tenant.maintenance.categoryPlaceholder")}</option>
            {CATEGORIES.map((code) => (
              <option key={code} value={code}>
                {t(CATEGORY_KEYS[code])}
              </option>
            ))}
          </select>
          {fieldErrors?.category && (
            <p className="text-sm text-red-600">{fieldErrors.category}</p>
          )}
        </label>

        <div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={disabled || submitting}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.target.value = "";
              setPhoto(file);
              setPhotoPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          <button
            type="button"
            disabled={disabled || submitting}
            onClick={() => photoRef.current?.click()}
            className="flex min-h-14 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Camera className="h-6 w-6" strokeWidth={1.5} />
            {photo ? t("tenant.maintenance.photoReplace") : t("tenant.maintenance.photoAdd")}
          </button>
          {photoPreview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photoPreview}
              alt={t("tenant.maintenance.photoPreviewAlt")}
              className="mt-3 max-h-40 w-full rounded-lg border border-zinc-200 object-cover"
            />
          )}
          {fieldErrors?.photo && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.photo}</p>
          )}
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-900">
            {t("tenant.maintenance.descriptionLabel")}
          </span>
          <textarea
            value={description}
            disabled={disabled || submitting}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder={t("tenant.maintenance.descriptionPlaceholder")}
            className="w-full rounded-lg border border-zinc-200 px-3 py-3 text-base text-zinc-900"
          />
          {fieldErrors?.description && (
            <p className="text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </label>

        <button
          type="button"
          disabled={disabled || submitting}
          onClick={() => onSubmit({ category, description, photo })}
          className="inline-flex min-h-14 w-full items-center justify-center gap-x-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-5 w-5" strokeWidth={1.5} />
          {submitting ? t("tenant.maintenance.submitting") : t("tenant.maintenance.submit")}
        </button>
      </div>
    </section>
  );
}
