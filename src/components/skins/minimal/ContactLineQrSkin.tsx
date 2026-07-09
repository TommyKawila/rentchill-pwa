"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

type UploadStatus = "idle" | "uploading" | "error";

interface ContactLineQrSkinProps {
  propertySlug: string;
  qrUrl: string | null;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}

export function ContactLineQrSkin({
  propertySlug,
  qrUrl,
  onUploaded,
  onRemove,
}: ContactLineQrSkinProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    if (!propertySlug) return;

    setStatus("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertySlug)}/contact-qr`,
        { method: "POST", body: formData },
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        url?: string;
      };

      if (!response.ok || !payload.ok || !payload.url) {
        throw new Error(payload.error ?? "อัปโหลดไม่สำเร็จ");
      }

      onUploaded(payload.url);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium">{t("settings.contactLineQr")}</span>
      <p className="text-xs text-zinc-500">{t("settings.contactLineQrHint")}</p>

      {qrUrl ? (
        <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={t("settings.contactLineQrAlt")}
            className="h-24 w-24 rounded-md border border-zinc-100 object-contain"
          />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={status === "uploading"}
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-700 disabled:opacity-50"
            >
              {status === "uploading" ? t("common.saving") : t("settings.contactLineQrReplace")}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="text-left text-xs text-zinc-500 underline"
            >
              {t("settings.contactLineQrRemove")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={status === "uploading" || !propertySlug}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border border-dashed border-zinc-300 bg-white py-4 text-sm text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "uploading"
            ? t("common.saving")
            : t("settings.contactLineQrUpload")}
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
          if (file) void handleUpload(file);
        }}
      />

      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
