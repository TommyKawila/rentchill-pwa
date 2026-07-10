"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

interface PropertyGallerySkinProps {
  urls: string[];
  propertyName: string;
}

export function PropertyGallerySkin({
  urls,
  propertyName,
}: PropertyGallerySkinProps) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);

  if (urls.length === 0) return null;

  const activeUrl = urls[activeIndex] ?? urls[0];

  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeUrl}
          alt={t("property.gallery.heroAlt", { name: propertyName })}
          className="aspect-[4/3] w-full object-cover"
        />
      </div>

      {urls.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={t("property.gallery.thumbAlt", {
                  index: String(index + 1),
                })}
                className={`overflow-hidden rounded-lg border bg-white ${
                  index === activeIndex
                    ? "border-green-600 ring-1 ring-green-600"
                    : "border-zinc-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-16 w-20 object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
