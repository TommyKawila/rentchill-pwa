"use client";

import { useLocale } from "@/components/LocaleProvider";

interface PropertyQrSkinProps {
  targetUrl: string;
}

export function PropertyQrSkin({ targetUrl }: PropertyQrSkinProps) {
  const { t } = useLocale();
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;

  return (
    <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 text-center">
      <h2 className="text-lg font-semibold">{t("property.qr.title")}</h2>
      <p className="mt-2 text-sm text-zinc-600">{t("property.qr.desc")}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrSrc}
        alt={t("property.qr.alt")}
        width={200}
        height={200}
        className="mx-auto mt-4 rounded-md border border-zinc-200"
      />
      <p className="mt-3 break-all text-xs text-zinc-500">{targetUrl}</p>
    </section>
  );
}
