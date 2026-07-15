"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PropertyContact } from "@/services/types";

interface ContactLandlordSkinProps {
  contact: PropertyContact;
}

export function ContactLandlordSkin({ contact }: ContactLandlordSkinProps) {
  const { t } = useLocale();
  const lineUrl = contact.contact_line_url?.trim() || null;
  const qrUrl = contact.contact_line_qr_url?.trim() || null;
  const phone = contact.contact_phone?.trim() || null;

  if (!lineUrl && !qrUrl && !phone) return null;

  return (
    <section className="border-t border-zinc-100 px-6 py-4">
      <p className="text-sm text-zinc-500">{t("tenant.contact.hint")}</p>
      <div className="mt-3 flex flex-col gap-3">
        {qrUrl && (
          <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={t("tenant.contact.qrAlt")}
              className="mx-auto h-36 w-36 object-contain"
            />
            <p className="mt-2 text-sm text-zinc-500">{t("tenant.contact.qrHint")}</p>
          </div>
        )}
        {lineUrl && (
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-800"
          >
            {t("tenant.contact.line")}
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-800"
          >
            {t("tenant.contact.phone")}
          </a>
        )}
      </div>
    </section>
  );
}
