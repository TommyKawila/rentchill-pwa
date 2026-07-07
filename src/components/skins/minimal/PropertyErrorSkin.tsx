"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";

interface PropertyErrorSkinProps {
  titleKey: "property.dbError" | "property.notFound";
  hintKey: "property.dbErrorHint" | "property.notFoundHint";
}

export function PropertyErrorSkin({ titleKey, hintKey }: PropertyErrorSkinProps) {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <LocaleToggleSkin />
        </div>
        <h1 className="text-2xl font-bold">{t(titleKey)}</h1>
        <p className="mt-2 text-sm text-zinc-600">{t(hintKey)}</p>
      </div>
    </main>
  );
}
