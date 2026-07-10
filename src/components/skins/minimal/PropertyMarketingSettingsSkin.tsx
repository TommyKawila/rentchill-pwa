"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { usePropertyMarketing } from "@/hooks/usePropertyMarketing";
import { MAX_GALLERY_IMAGES } from "@/services/propertyGalleryUploadService";

interface PropertyMarketingSettingsSkinProps {
  propertySlug: string;
}

export function PropertyMarketingSettingsSkin({
  propertySlug,
}: PropertyMarketingSettingsSkinProps) {
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
    <div className="border-t border-zinc-200 pt-6">
      <h2 className="text-sm font-semibold">{t("settings.marketingTitle")}</h2>
      <p className="mt-1 text-xs text-zinc-500">{t("settings.marketingDesc")}</p>

      {status === "loading" && (
        <p className="mt-4 text-sm text-zinc-500">{t("common.loading")}</p>
      )}

      {error && (
        <p className="mt-4 text-xs text-red-700">{error}</p>
      )}

      {marketing && (
        <div className="mt-4 space-y-4">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.marketingDescription")}</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder={t("settings.marketingDescriptionPlaceholder")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">{t("settings.marketingAddress")}</span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={t("settings.marketingAddressPlaceholder")}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <div className="space-y-2">
            <span className="block text-sm font-medium">
              {t("settings.marketingGallery")}
            </span>
            <p className="text-xs text-zinc-500">
              {t("settings.marketingGalleryHint", {
                max: String(MAX_GALLERY_IMAGES),
              })}
            </p>

            {galleryUrls.length > 0 && (
              <ul className="grid grid-cols-3 gap-2">
                {galleryUrls.map((url) => (
                  <li
                    key={url}
                    className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white"
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
                      className="absolute right-1 top-1 rounded bg-white/90 px-2 py-0.5 text-xs text-zinc-700 disabled:opacity-50"
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
                className="w-full rounded-lg border border-dashed border-zinc-300 bg-white py-4 text-sm text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
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

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void save({
                marketing_description: description,
                marketing_address: address,
              })
            }
            className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "saving" ? t("common.saving") : t("settings.marketingSave")}
          </button>

          <a
            href={`/${encodeURIComponent(propertySlug)}?from=owner`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-green-700 underline"
          >
            {t("settings.marketingPreview")}
          </a>
        </div>
      )}
    </div>
  );
}
