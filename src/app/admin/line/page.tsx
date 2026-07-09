"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";
import { AdminPlatformShell } from "@/components/skins/minimal/AdminPlatformShell";
import { useLineRichMenu } from "@/hooks/useLineRichMenu";
import { usePlatformStats } from "@/hooks/usePlatformStats";

function LineSetupContent() {
  const { t } = useLocale();
  const router = useRouter();
  const { status, loading, deploying, error, success, deploy } = useLineRichMenu();
  const stats = usePlatformStats();
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <AdminPlatformShell
      pendingPayments={stats.stats?.pending_payments ?? 0}
      onLogout={() => {
        void fetch("/api/admin/login", { method: "DELETE" }).then(() => {
          router.replace("/admin/login");
        });
      }}
    >
      <section className="mt-8 space-y-4 text-sm">
        <div>
          <h2 className="text-sm font-semibold">{t("line.title")}</h2>
          <p className="mt-1 text-xs text-zinc-500">{t("line.desc")}</p>
        </div>

        {loading && <p className="text-zinc-500">{t("common.loading")}</p>}

        {status && (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
            {status.botReady && status.botName ? (
              <p className="text-green-700">
                {t("line.bot")} {status.botName}
              </p>
            ) : (
              <p className="text-amber-700">
                {status.botTokenError
                  ? `${t("line.botMissing")}: ${status.botTokenError}`
                  : t("line.tokenMissing")}
              </p>
            )}

            {status.webhookConfigured ? (
              <p className="text-green-700">{t("line.webhookReady")}</p>
            ) : (
              <p className="text-amber-700">{t("line.webhookMissingSecret")}</p>
            )}

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

            <button
              type="button"
              onClick={() => setShowTechnical((v) => !v)}
              className="text-xs text-zinc-500 underline"
            >
              {t("line.technical")}
            </button>

            {showTechnical && (
              <div className="space-y-2 border-t border-zinc-100 pt-2 text-xs text-zinc-600">
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
                {status.webhookUrl && (
                  <p>
                    <span className="text-zinc-500">{t("line.webhookUrl")}</span>{" "}
                    <span className="break-all">{status.webhookUrl}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={deploying || loading || !status?.configured}
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
      </section>
    </AdminPlatformShell>
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
