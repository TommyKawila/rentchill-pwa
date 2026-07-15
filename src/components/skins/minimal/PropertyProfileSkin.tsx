"use client";

import { MapPin } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { LocaleToggleSkin } from "@/components/skins/minimal/LocaleToggleSkin";
import { PropertyContactCtaSkin } from "@/components/skins/minimal/PropertyContactCtaSkin";
import { PropertyGallerySkin } from "@/components/skins/minimal/PropertyGallerySkin";
import { PropertyQrSkin } from "@/components/skins/minimal/PropertyQrSkin";
import type { PropertyContact } from "@/services/types";

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
  galleryUrls: string[];
  marketingDescription: string | null;
  marketingAddress: string | null;
  startingRent: number | null;
  contact: PropertyContact;
  includeUtilities: boolean;
  waterRatePerUnit: number;
  electricRatePerUnit: number;
  fromOwner?: boolean;
}

export function PropertyProfileSkin({
  name,
  slug,
  propertyUrl,
  rooms,
  galleryUrls,
  marketingDescription,
  marketingAddress,
  startingRent,
  contact,
  includeUtilities,
  waterRatePerUnit,
  electricRatePerUnit,
  fromOwner,
}: PropertyProfileSkinProps) {
  const { locale, t } = useLocale();
  const priceLocale = locale === "th" ? "th-TH" : "en-US";

  const fallbackDesc = t("property.desc");
  const description = marketingDescription?.trim() || fallbackDesc;

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-zinc-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="border-b border-zinc-100 pb-6">
          {fromOwner && (
            <a
              href={`/dashboard?property=${encodeURIComponent(slug)}`}
              className="inline-flex min-h-12 items-center text-base text-zinc-500 underline-offset-2 hover:text-zinc-700 hover:underline"
            >
              {t("property.backToDashboard")}
            </a>
          )}
          <div className={`flex items-start justify-between gap-3 ${fromOwner ? "mt-3" : ""}`}>
            <p className="text-sm font-medium uppercase tracking-wide text-green-600">
              {t("property.tag")}
            </p>
            <LocaleToggleSkin />
          </div>
          <h1 className="mt-2 text-3xl font-bold">{name}</h1>
        </header>

        <PropertyGallerySkin urls={galleryUrls} propertyName={name} />

        <section className="rounded-xl border border-zinc-100 bg-zinc-50 p-6">
          {startingRent !== null && (
            <p className="text-2xl font-bold text-zinc-900">
              {t("property.priceFrom", {
                price: startingRent.toLocaleString(priceLocale),
              })}
            </p>
          )}

          {marketingAddress?.trim() && (
            <p className="mt-3 flex items-start gap-x-2 text-sm text-zinc-600">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span>{marketingAddress.trim()}</span>
            </p>
          )}

          <p className="mt-3 whitespace-pre-line text-sm text-zinc-600">
            {description}
          </p>

          <p className="mt-4 text-sm text-zinc-500">
            {includeUtilities
              ? t("property.utilitiesIncluded")
              : t("property.utilitiesExtra", {
                  water: waterRatePerUnit.toLocaleString(priceLocale),
                  electric: electricRatePerUnit.toLocaleString(priceLocale),
                })}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">{t("property.availableRooms")}</h2>
          {rooms.length === 0 ? (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6">
              {fromOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    {t("property.ownerEmptyDesc")}
                  </p>
                  <a
                    href={`/dashboard?property=${encodeURIComponent(slug)}`}
                    className="inline-flex min-h-14 items-center rounded-lg bg-rc-green px-6 text-base font-medium text-white hover:bg-rc-green-dark"
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
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <div>
                    <p className="text-base font-bold">
                      {t("common.room", { number: room.room_number })}
                    </p>
                    <p className="text-base text-zinc-600">
                      {t("property.rentPerMonth", {
                        price: room.base_rent_price.toLocaleString(priceLocale),
                      })}
                    </p>
                  </div>
                  <span className="rounded-lg bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
                    {t("property.vacant")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <PropertyContactCtaSkin contact={contact} />

        <div className="mt-8">
          <PropertyQrSkin targetUrl={propertyUrl} />
        </div>

        <footer className="mt-10 text-center">
          <p className="text-sm text-zinc-500">{t("property.footer")}</p>
          <p className="mt-1 text-sm text-zinc-400">/{slug}</p>
        </footer>
      </div>
    </main>
  );
}
