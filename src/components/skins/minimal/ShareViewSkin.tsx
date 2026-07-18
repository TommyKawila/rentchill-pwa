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
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="max-w-md rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <p className="text-base font-semibold text-zinc-900">{t("share.expiredTitle")}</p>
          <p className="mt-2 text-base text-zinc-600">{t("share.expiredDesc")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-900">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="border-b border-zinc-100 pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-rc-green">
            {t("share.tag")}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{data.property_name}</h1>
          <p className="mt-1 text-base text-zinc-600">
            {t("share.month", { month: data.billing_month })}
          </p>
          <p className="mt-2 text-sm text-zinc-500">{t("share.readOnly")}</p>
          {data.expires_at && (
            <p className="mt-1 text-sm text-amber-700">
              {t("share.expires", {
                date: new Date(data.expires_at).toLocaleString(),
              })}
            </p>
          )}
        </header>

        {data.rows.length === 0 ? (
          <p className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-base text-zinc-600">
            {t("share.noBills")}
          </p>
        ) : (
          <section className="space-y-3">
            {data.rows.map((row) => (
              <article
                key={`${row.room_number}-${row.tenant_name}`}
                className="rounded-xl border border-zinc-100 bg-white p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{row.tenant_name}</p>
                    <p className="text-sm text-zinc-500">
                      {t("common.room", { number: row.room_number })}
                    </p>
                  </div>
                  <span className="rounded-lg bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
                    {t(statusMessageKey(row.status))}
                  </span>
                </div>
                <p className="mt-2 text-base font-bold">
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
