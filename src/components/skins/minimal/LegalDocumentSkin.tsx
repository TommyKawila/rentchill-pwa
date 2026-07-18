"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { BrandLogoSkin } from "@/components/skins/minimal/BrandLogoSkin";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import type { LegalDocument } from "@/content/legal/types";
import { PRIVACY_POLICY_VERSION } from "@/content/legal/version";

interface LegalDocumentSkinProps {
  document: LegalDocument;
  active: "privacy" | "terms" | "contact";
}

export function LegalDocumentSkin({ document, active }: LegalDocumentSkinProps) {
  const { t } = useLocale();

  const nav = [
    { id: "privacy" as const, href: "/privacy", label: t("legal.nav.privacy") },
    { id: "terms" as const, href: "/terms", label: t("legal.nav.terms") },
    { id: "contact" as const, href: "/contact", label: t("legal.nav.contact") },
  ];

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
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{document.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {t("legal.updated", { date: document.updatedAt })} · v{PRIVACY_POLICY_VERSION}
        </p>

        <div className="mt-8 divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
          {document.sections.map((section) => (
            <section key={section.title} className="p-6">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-zinc-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <footer className="border-t border-zinc-100 bg-white px-4 py-8">
        <nav className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={
                item.id === active
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
