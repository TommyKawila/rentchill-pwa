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
}

export function PropertyProfileSkin({
  name,
  slug,
  propertyUrl,
  rooms,
}: PropertyProfileSkinProps) {
  const { locale, t } = useLocale();
  const priceLocale = locale === "th" ? "th-TH" : "en-US";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-zinc-200 pb-6">
          <div className="flex items-start justify-between gap-3">
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
              <p className="text-sm text-zinc-600">{t("property.noRooms")}</p>
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
