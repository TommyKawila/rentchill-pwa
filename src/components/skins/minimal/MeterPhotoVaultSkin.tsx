"use client";

import { useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { MeterPhotoRow, MeterUtilityType } from "@/services/meterPhotoService";
import {
  canBrowseMeterHistory,
  canUploadMeterPhoto,
} from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

interface MeterPhotoVaultSkinProps {
  planTier: PlanTier;
  photos: MeterPhotoRow[];
  disabled?: boolean;
  uploading?: boolean;
  error?: string | null;
  onUpload: (utilityType: MeterUtilityType, file: File) => void;
}

function photosForUtility(photos: MeterPhotoRow[], utility: MeterUtilityType) {
  return photos.filter((photo) => photo.utility_type === utility);
}

export function MeterPhotoVaultSkin({
  planTier,
  photos,
  disabled,
  uploading,
  error,
  onUpload,
}: MeterPhotoVaultSkinProps) {
  const { t } = useLocale();
  const waterRef = useRef<HTMLInputElement>(null);
  const electricRef = useRef<HTMLInputElement>(null);
  const canUpload = canUploadMeterPhoto(planTier);
  const canHistory = canBrowseMeterHistory(planTier);

  if (!canUpload) {
    return (
      <p className="text-xs text-zinc-500">{t("owner.meterPhoto.upgradeHint")}</p>
    );
  }

  const busy = disabled || uploading;

  return (
    <div className="space-y-3 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-zinc-700">{t("owner.meterPhoto.title")}</p>
        {!canHistory && (
          <span className="text-[11px] text-zinc-500">{t("owner.meterPhoto.currentOnly")}</span>
        )}
      </div>

      {(["water", "electric"] as const).map((utility) => {
        const utilityPhotos = photosForUtility(photos, utility);
        const inputRef = utility === "water" ? waterRef : electricRef;

        return (
          <div key={utility} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-600">
                {utility === "water"
                  ? t("owner.billing.water")
                  : t("owner.billing.electric")}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="min-h-11 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? t("common.saving") : t("owner.meterPhoto.capture")}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) onUpload(utility, file);
                }}
              />
            </div>
            {utilityPhotos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {utilityPhotos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block shrink-0"
                  >
                    <img
                      src={photo.public_url}
                      alt={utility}
                      className="h-16 w-16 rounded-md border border-zinc-200 object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
