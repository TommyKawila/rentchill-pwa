"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { useExcelImporter } from "@/hooks/useExcelImporter";

export default function ImportPage() {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
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

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("import.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("import.title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("import.desc")}</p>
        </header>

        <a
          href="/dashboard"
          className="mt-4 inline-block text-sm text-zinc-600 underline"
        >
          {t("common.backToDashboard")}
        </a>

        <section className="mt-8 space-y-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="w-full rounded-md border border-zinc-300 bg-white py-3 text-sm font-medium"
          >
            {t("import.downloadTemplate")}
          </button>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
            <span className="text-sm font-medium">{t("import.selectFile")}</span>
            <span className="mt-1 text-xs text-zinc-500">
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
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
              <p>{t("import.propertyCount", { count: preview.propertyCount })}</p>
              <p>{t("import.roomCount", { count: preview.roomCount })}</p>
              <p className="mt-2 break-all text-zinc-600">
                {t("import.slugs", { slugs: preview.slugs.join(", ") })}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!file || status === "importing" || status === "parsing"}
            onClick={() => file && void importFile(file)}
            className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "importing" ? t("import.importing") : t("import.submit")}
          </button>

          {status === "success" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-medium">{t("import.success")}</p>
              {resultSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/${slug}`}
                  className="mt-2 block underline"
                >
                  {t("import.openProperty", { slug })}
                </a>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
