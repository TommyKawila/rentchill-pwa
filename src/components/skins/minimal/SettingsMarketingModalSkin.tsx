"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import { usePropertyMarketing } from "@/hooks/usePropertyMarketing";
import { MAX_GALLERY_IMAGES } from "@/services/propertyGalleryUploadService";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface SettingsMarketingModalSkinProps {
  propertySlug: string;
  onClose: () => void;
}

export function SettingsMarketingModalSkin({
  propertySlug,
  onClose,
}: SettingsMarketingModalSkinProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const { marketing, status, error, save, uploadGallery, removeGallery } =
    usePropertyMarketing(propertySlug);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!marketing) return;
    setDescription(marketing.marketing_description ?? "");
    setAddress(marketing.marketing_address ?? "");
  }, [marketing]);

  const galleryUrls = marketing?.gallery_urls ?? [];
  const canUpload = galleryUrls.length < MAX_GALLERY_IMAGES;
  const busy = status === "loading" || status === "saving" || status === "uploading";

  return (
    <SettingsSectionModalShell
      title={t("settings.marketingTitle")}
      subtitle={t("settings.marketingDesc")}
      onClose={onClose}
      saveLabel={t("settings.marketingSave")}
      saving={status === "saving"}
      saveDisabled={busy || !marketing}
      onSave={() =>
        void save({
          marketing_description: description,
          marketing_address: address,
        }).then(() => onClose())
      }
    >
      {status === "loading" && (
        <p className="text-base text-zinc-500">{t("common.loading")}</p>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {marketing && (
        <div className="space-y-4">
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">
              {t("settings.marketingDescription")}
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder={t("settings.marketingDescriptionPlaceholder")}
              className={`${inputClass} min-h-[6rem]`}
            />
          </label>

          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">
              {t("settings.marketingAddress")}
            </span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={t("settings.marketingAddressPlaceholder")}
              className={inputClass}
            />
          </label>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-zinc-900">
              {t("settings.marketingGallery")}
            </span>
            <p className="text-sm text-zinc-500">
              {t("settings.marketingGalleryHint", {
                max: String(MAX_GALLERY_IMAGES),
              })}
            </p>

            {galleryUrls.length > 0 && (
              <ul className="grid grid-cols-3 gap-3">
                {galleryUrls.map((url) => (
                  <li
                    key={url}
                    className="relative overflow-hidden rounded-xl border border-zinc-100 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={t("settings.marketingGalleryAlt")}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeGallery(url)}
                      className="absolute right-1 top-1 flex min-h-12 items-center rounded-lg bg-white/90 px-3 text-sm text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t("settings.marketingGalleryRemove")}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {canUpload && (
              <button
                type="button"
                disabled={busy || !propertySlug}
                onClick={() => inputRef.current?.click()}
                className="flex min-h-[52px] w-full items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-white text-base text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "uploading"
                  ? t("common.saving")
                  : t("settings.marketingGalleryUpload")}
              </button>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void uploadGallery(file);
              }}
            />
          </div>

          <a
            href={`/${encodeURIComponent(propertySlug)}?from=owner`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center text-center text-base text-rc-green-ink underline"
          >
            {t("settings.marketingPreview")}
          </a>
        </div>
      )}
    </SettingsSectionModalShell>
  );
}
