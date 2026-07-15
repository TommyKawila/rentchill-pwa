"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { MeterPhotoRow } from "@/services/meterPhotoService";

interface TenantMeterPhotosSkinProps {
  photos: MeterPhotoRow[];
}

export function TenantMeterPhotosSkin({ photos }: TenantMeterPhotosSkinProps) {
  const { t } = useLocale();

  if (photos.length === 0) return null;

  const water = photos.filter((p) => p.utility_type === "water");
  const electric = photos.filter((p) => p.utility_type === "electric");

  return (
    <section className="border-t border-zinc-100 px-6 py-4">
      <p className="text-sm font-medium text-zinc-900">{t("tenant.meterPhoto.title")}</p>
      <p className="mt-1 text-sm text-zinc-500">{t("tenant.meterPhoto.desc")}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {water.length > 0 && (
          <div>
            <p className="text-sm text-zinc-500">{t("owner.billing.water")}</p>
            <div className="mt-1 flex gap-3 overflow-x-auto">
              {water.map((photo) => (
                <a key={photo.id} href={photo.public_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.public_url}
                    alt="water meter"
                    className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        {electric.length > 0 && (
          <div>
            <p className="text-sm text-zinc-500">{t("owner.billing.electric")}</p>
            <div className="mt-1 flex gap-3 overflow-x-auto">
              {electric.map((photo) => (
                <a key={photo.id} href={photo.public_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.public_url}
                    alt="electric meter"
                    className="h-20 w-20 rounded-lg border border-zinc-200 object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
