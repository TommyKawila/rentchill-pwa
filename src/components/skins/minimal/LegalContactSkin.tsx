"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { BrandLogoSkin } from "@/components/skins/minimal/BrandLogoSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { LEGAL_UPDATED_AT, PRIVACY_POLICY_VERSION } from "@/content/legal/version";

export function LegalContactSkin() {
  const { t } = useLocale();
  const email = process.env.NEXT_PUBLIC_PDPA_CONTACT_EMAIL?.trim() ?? "";

  const nav = [
    { id: "privacy", href: "/privacy", label: t("legal.nav.privacy") },
    { id: "terms", href: "/terms", label: t("legal.nav.terms") },
    { id: "contact", href: "/contact", label: t("legal.nav.contact") },
  ] as const;

  return (
    <main className="min-h-screen bg-rc-bg text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/" className="min-h-12 inline-flex items-center">
            <BrandLogoSkin size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <LocaleToggleSkin />
            <Link
              href="/"
              className="inline-flex min-h-12 items-center px-2 text-sm text-zinc-500 hover:text-zinc-900"
            >
              {t("legal.nav.home")}
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("legal.contact.title")}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {t("legal.updated", { date: LEGAL_UPDATED_AT })} · v{PRIVACY_POLICY_VERSION}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          {t("legal.contact.desc")}
        </p>

        <div className="mt-8 rounded-xl border border-zinc-100 bg-white p-6">
          <p className="text-sm font-semibold text-zinc-900">{t("legal.contact.emailLabel")}</p>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-2 inline-flex min-h-12 items-center text-base font-medium text-rc-green-ink underline"
            >
              {email}
            </a>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">{t("legal.contact.emailFallback")}</p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            {t("legal.contact.rightsHint")}
          </p>
        </div>
      </article>

      <footer className="border-t border-zinc-100 bg-white px-4 py-8">
        <nav className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={
                item.id === "contact"
                  ? "font-medium text-rc-green-ink"
                  : "text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  );
}
