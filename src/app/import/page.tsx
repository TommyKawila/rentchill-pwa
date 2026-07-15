"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { OwnerBottomNavSkin } from "@/components/skins/minimal/OwnerBottomNavSkin";
import { OwnerPushNotificationPrompts } from "@/components/skins/minimal/OwnerPushNotificationPrompts";
import { useExcelImporter } from "@/hooks/useExcelImporter";
import { useOwnerProperties } from "@/hooks/useOwnerProperties";
import { resolveOwnerPropertySlug } from "@/services/resolveOwnerPropertySlug";

function ImportContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugFromUrl = searchParams.get("property");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const { properties, status: propertiesStatus } = useOwnerProperties();
  const propertySlug = useMemo(
    () =>
      resolveOwnerPropertySlug(
        slugFromUrl,
        properties,
        propertiesStatus === "loading",
      ),
    [slugFromUrl, properties, propertiesStatus],
  );

  useEffect(() => {
    if (propertiesStatus !== "idle" || properties.length === 0) return;
    if (!propertySlug) return;
    if (slugFromUrl === propertySlug) return;
    router.replace(`/import?property=${encodeURIComponent(propertySlug)}`);
  }, [propertiesStatus, properties.length, slugFromUrl, propertySlug, router]);

  const {
    status,
    error,
    preview,
    resultSlugs,
    parseFile,
    importFile,
    downloadTemplate,
  } = useExcelImporter();

  const onFileChange = async (next: File | null) => {
    setFile(next);
    if (next) await parseFile(next);
  };

  const busy = status === "importing" || status === "parsing";
  const dashboardHref = propertySlug
    ? `/dashboard?property=${encodeURIComponent(propertySlug)}`
    : "/dashboard";

  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-24 text-zinc-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="border-b border-zinc-100 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium uppercase tracking-wide text-green-600">
              {t("import.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{t("import.title")}</h1>
          <p className="mt-2 text-base text-zinc-600">{t("import.desc")}</p>
        </header>

        <a
          href={dashboardHref}
          className="inline-flex min-h-12 items-center text-base text-zinc-600 underline"
        >
          {t("common.backToDashboard")}
        </a>

        <section className="space-y-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium"
          >
            {t("import.downloadTemplate")}
          </button>

          <label className="flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
            <span className="text-base font-medium">{t("import.selectFile")}</span>
            <span className="mt-1 text-sm text-zinc-500">
              {file?.name ?? t("import.noFile")}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(event) => void onFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          {preview && (
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-base">
              <p>{t("import.propertyCount", { count: preview.propertyCount })}</p>
              <p>{t("import.roomCount", { count: preview.roomCount })}</p>
              <p className="mt-2 break-all text-zinc-600">
                {t("import.slugs", { slugs: preview.slugs.join(", ") })}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!file || busy}
            onClick={() => file && void importFile(file)}
            className="flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "importing" ? t("import.importing") : t("import.submit")}
          </button>

          {status === "success" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-base text-green-800">
              <p className="font-medium">{t("import.success")}</p>
              {resultSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/${slug}`}
                  className="mt-2 flex min-h-12 items-center underline"
                >
                  {t("import.openProperty", { slug })}
                </a>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-base text-red-600">
              {error}
            </div>
          )}
        </section>
      </div>

      {propertySlug && (
        <OwnerBottomNavSkin activeTab="home" propertySlug={propertySlug} />
      )}
      <OwnerPushNotificationPrompts />
    </main>
  );
}

export default function ImportPage() {
  const { t } = useLocale();

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-base text-zinc-500">
          {t("common.loading")}
        </main>
      }
    >
      <ImportContent />
    </Suspense>
  );
}
