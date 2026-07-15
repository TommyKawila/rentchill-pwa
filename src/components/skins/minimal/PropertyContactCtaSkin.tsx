"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { PropertyContact } from "@/services/types";

interface PropertyContactCtaSkinProps {
  contact: PropertyContact;
}

export function PropertyContactCtaSkin({ contact }: PropertyContactCtaSkinProps) {
  const { t } = useLocale();
  const lineUrl = contact.contact_line_url?.trim() || null;
  const phone = contact.contact_phone?.trim() || null;

  if (!lineUrl && !phone) return null;

  return (
    <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold">{t("property.cta.title")}</h2>
      <p className="mt-1 text-sm text-zinc-600">{t("property.cta.desc")}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {lineUrl && (
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-x-2 rounded-xl border border-zinc-300 bg-white text-base font-medium text-zinc-800"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
            {t("property.cta.line")}
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-x-2 rounded-xl border border-zinc-300 bg-white text-base font-medium text-zinc-800"
          >
            <Phone className="h-5 w-5" strokeWidth={1.5} />
            {t("property.cta.phone")}
          </a>
        )}
      </div>
    </section>
  );
}
