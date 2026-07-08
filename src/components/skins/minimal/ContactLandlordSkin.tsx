"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { PropertyContact } from "@/services/types";

interface ContactLandlordSkinProps {
  contact: PropertyContact;
}

export function ContactLandlordSkin({ contact }: ContactLandlordSkinProps) {
  const { t } = useLocale();
  const lineUrl = contact.contact_line_url?.trim() || null;
  const phone = contact.contact_phone?.trim() || null;

  if (!lineUrl && !phone) return null;

  return (
    <section className="border-t border-zinc-200 px-6 py-4">
      <p className="text-xs text-zinc-500">{t("tenant.contact.hint")}</p>
      <div className="mt-2 flex flex-col gap-2">
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
