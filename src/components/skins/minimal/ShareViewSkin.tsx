"use client";

import { useLocale } from "@/components/LocaleProvider";
import { statusMessageKey } from "@/services/i18n/translate";
import type { ShareViewData } from "@/services/magicLinkService";

interface ShareViewSkinProps {
  data: ShareViewData;
}

export function ShareViewSkin({ data }: ShareViewSkinProps) {
  const { t } = useLocale();

  if (data.is_expired) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-zinc-900">{t("share.expiredTitle")}</p>
          <p className="mt-2 text-sm text-zinc-600">{t("share.expiredDesc")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            {t("share.tag")}
          </p>
          <h1 className="mt-2 text-2xl font-bold">{data.property_name}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {t("share.month", { month: data.billing_month })}
          </p>
          <p className="mt-2 text-xs text-zinc-500">{t("share.readOnly")}</p>
          {data.expires_at && (
            <p className="mt-1 text-xs text-amber-700">
              {t("share.expires", {
                date: new Date(data.expires_at).toLocaleString(),
              })}
            </p>
          )}
        </header>

        {data.rows.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-600">{t("share.noBills")}</p>
        ) : (
          <section className="mt-8 space-y-3">
            {data.rows.map((row) => (
              <article
                key={`${row.room_number}-${row.tenant_name}`}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{row.tenant_name}</p>
                    <p className="text-xs text-zinc-500">
                      {t("common.room", { number: row.room_number })}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                    {t(statusMessageKey(row.status))}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">
                  {t("common.total")} ฿{row.total_amount.toLocaleString("th-TH")}
                </p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
