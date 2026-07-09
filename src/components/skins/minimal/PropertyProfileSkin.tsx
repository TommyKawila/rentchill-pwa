"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { PropertyQrSkin } from "@/components/skins/minimal/PropertyQrSkin";

interface Room {
  id: string;
  room_number: string;
  base_rent_price: number;
}

interface PropertyProfileSkinProps {
  name: string;
  slug: string;
  propertyUrl: string;
  rooms: Room[];
  fromOwner?: boolean;
}

export function PropertyProfileSkin({
  name,
  slug,
  propertyUrl,
  rooms,
  fromOwner,
}: PropertyProfileSkinProps) {
  const { locale, t } = useLocale();
  const priceLocale = locale === "th" ? "th-TH" : "en-US";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-zinc-200 pb-6">
          {fromOwner && (
            <a
              href={`/dashboard?property=${encodeURIComponent(slug)}`}
              className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline"
            >
              {t("property.backToDashboard")}
            </a>
          )}
          <div className={`flex items-start justify-between gap-3 ${fromOwner ? "mt-3" : ""}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              {t("property.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-3xl font-bold">{name}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("property.desc")}</p>
        </header>

        <PropertyQrSkin targetUrl={propertyUrl} />

        <section className="mt-8">
          <h2 className="text-lg font-semibold">{t("property.availableRooms")}</h2>
          {rooms.length === 0 ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6">
              {fromOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    {t("property.ownerEmptyDesc")}
                  </p>
                  <a
                    href={`/dashboard?property=${encodeURIComponent(slug)}`}
                    className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    {t("property.ownerEmptyCta")}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">{t("property.noRooms")}</p>
              )}
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium">
                      {t("common.room", { number: room.room_number })}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {t("property.rentPerMonth", {
                        price: room.base_rent_price.toLocaleString(priceLocale),
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {t("property.vacant")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-10 text-center">
          <p className="text-xs text-zinc-500">{t("property.footer")}</p>
          <p className="mt-1 text-xs text-zinc-400">/{slug}</p>
        </footer>
      </div>
    </main>
  );
}
