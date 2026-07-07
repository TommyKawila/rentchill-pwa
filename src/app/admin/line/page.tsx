"use client";

import { Suspense } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { useLineRichMenu } from "@/hooks/useLineRichMenu";

function LineSetupContent() {
  const { t } = useLocale();
  const { status, loading, deploying, error, success, deploy } = useLineRichMenu();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("line.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{t("line.title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("line.desc")}</p>
        </header>

        <section className="mt-8 space-y-4 text-sm">
          {loading && <p className="text-zinc-500">{t("common.loading")}</p>}

          {status && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
              <p>
                <span className="text-zinc-500">{t("line.liffUrl")}</span>{" "}
                <a href={status.liffUrl} className="break-all underline">
                  {status.liffUrl}
                </a>
              </p>
              <p>
                <span className="text-zinc-500">{t("line.endpoint")}</span>{" "}
                <span className="break-all">{status.endpointUrl}</span>
              </p>
              {status.message && (
                <p className="text-amber-700">{status.message}</p>
              )}
              {status.richmenus && status.richmenus.length > 0 && (
                <p className="text-zinc-600">
                  {t("line.menus", {
                    names: status.richmenus.map((m) => m.name).join(", "),
                  })}
                </p>
              )}
            </div>
          )}

          <ol className="list-decimal space-y-2 pl-5 text-zinc-600">
            <li>{t("line.step1")}</li>
            <li>{t("line.step2")}</li>
            <li>{t("line.step3")}</li>
            <li>{t("line.step4")}</li>
          </ol>

          <button
            type="button"
            disabled={deploying || loading}
            onClick={() => void deploy()}
            className="w-full rounded-md bg-zinc-900 py-3 font-medium text-white disabled:opacity-50"
          >
            {deploying ? t("line.deploying") : t("line.deploy")}
          </button>

          {success && (
            <p className="rounded-md border border-green-200 bg-green-50 p-3 text-green-800">
              {success}
            </p>
          )}

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </p>
          )}

          <a href="/dashboard" className="block text-center underline">
            {t("common.backToDashboard")}
          </a>
        </section>
      </div>
    </main>
  );
}

function LineSetupFallback() {
  const { t } = useLocale();
  return (
    <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </main>
  );
}

export default function LineSetupPage() {
  return (
    <Suspense fallback={<LineSetupFallback />}>
      <LineSetupContent />
    </Suspense>
  );
}
