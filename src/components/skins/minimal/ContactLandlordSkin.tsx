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
    <section className="border-t border-zinc-200 px-6 py-4">
      <p className="text-xs text-zinc-500">{t("tenant.contact.hint")}</p>
      <div className="mt-2 flex flex-col gap-2">
        {qrUrl && (
          <div className="rounded-md border border-zinc-200 bg-white p-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={t("tenant.contact.qrAlt")}
              className="mx-auto h-36 w-36 object-contain"
            />
            <p className="mt-2 text-xs text-zinc-500">{t("tenant.contact.qrHint")}</p>
          </div>
        )}
        {lineUrl && (
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-md border border-zinc-300 bg-white py-2.5 text-center text-sm font-medium text-zinc-800"
          >
            {t("tenant.contact.line")}
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="w-full rounded-md border border-zinc-300 bg-white py-2.5 text-center text-sm font-medium text-zinc-800"
          >
            {t("tenant.contact.phone")}
          </a>
        )}
      </div>
    </section>
  );
}
