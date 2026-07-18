"use client";

import { useRef, useState } from "react";
import {
  Armchair,
  Camera,
  Droplets,
  Search,
  Snowflake,
  Wrench,
  Zap,
} from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { MaintenanceTicketCategory } from "@/services/types";

interface TenantMaintenanceFormSkinProps {
  disabled?: boolean;
  submitting?: boolean;
  success?: boolean;
  fieldErrors?: {
    category?: string;
    description?: string;
    media?: string;
  };
  onSubmit: (input: {
    category: MaintenanceTicketCategory | "";
    description: string;
    media: File | null;
  }) => void;
  onSubmitAnother?: () => void;
}

const CATEGORIES: MaintenanceTicketCategory[] = [
  "ac",
  "plumbing",
  "electrical",
  "furniture",
  "other",
];

const CATEGORY_KEYS = {
  ac: "tenant.maintenance.category.ac",
  plumbing: "tenant.maintenance.category.plumbing",
  electrical: "tenant.maintenance.category.electrical",
  furniture: "tenant.maintenance.category.furniture",
  other: "tenant.maintenance.category.other",
} as const;

const CATEGORY_ICONS = {
  ac: Snowflake,
  plumbing: Droplets,
  electrical: Zap,
  furniture: Armchair,
  other: Search,
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
  const mediaRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<MaintenanceTicketCategory | "">("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaIsVideo, setMediaIsVideo] = useState(false);

  if (success) {
    return (
      <section className="border-t border-zinc-100 bg-white p-6 text-center">
        <p className="text-base font-medium text-rc-green-ink">
          {t("tenant.maintenance.success")}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{t("tenant.maintenance.successHint")}</p>
        {onSubmitAnother && (
          <button
            type="button"
            onClick={onSubmitAnother}
            className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-900"
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
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {t("tenant.maintenance.categoryLabel")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((code) => {
              const Icon = CATEGORY_ICONS[code];
              const active = category === code;
              return (
                <button
                  key={code}
                  type="button"
                  disabled={disabled || submitting}
                  onClick={() => setCategory(code)}
                  className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-rc-green bg-rc-green-soft text-rc-green-ink"
                      : "border-zinc-100 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                  {t(CATEGORY_KEYS[code])}
                </button>
              );
            })}
          </div>
          {fieldErrors?.category && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
          )}
        </div>

        <div>
          <input
            ref={mediaRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            disabled={disabled || submitting}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.target.value = "";
              setMedia(file);
              setMediaIsVideo(Boolean(file?.type.startsWith("video/")));
              setMediaPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
          <button
            type="button"
            disabled={disabled || submitting}
            onClick={() => mediaRef.current?.click()}
            className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center text-base font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Camera className="h-7 w-7" strokeWidth={1.5} />
            {media ? t("tenant.maintenance.mediaReplace") : t("tenant.maintenance.mediaAdd")}
          </button>
          {mediaPreview && !mediaIsVideo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mediaPreview}
              alt={t("tenant.maintenance.photoPreviewAlt")}
              className="mt-3 max-h-40 w-full rounded-lg border border-zinc-200 object-cover"
            />
          )}
          {mediaPreview && mediaIsVideo && (
            <video
              src={mediaPreview}
              controls
              className="mt-3 max-h-40 w-full rounded-lg border border-zinc-200"
            />
          )}
          {fieldErrors?.media && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.media}</p>
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
          onClick={() => onSubmit({ category, description, media })}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-x-2 rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wrench className="h-5 w-5" strokeWidth={1.5} />
          {submitting ? t("tenant.maintenance.submitting") : t("tenant.maintenance.submit")}
        </button>
      </div>
    </section>
  );
}
