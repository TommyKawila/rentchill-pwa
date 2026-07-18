"use client";

import { useLocale } from "@/components/LocaleProvider";
import type {
  AnalyticsFilterRoom,
  AnalyticsTimeframe,
} from "@/services/analyticsCashflowService";
import type { OwnerPropertyOption } from "@/services/ownerPropertyService";

interface AnalyticsFilterSkinProps {
  timeframe: AnalyticsTimeframe;
  propertySlug: string;
  roomId: string;
  properties: OwnerPropertyOption[];
  rooms: AnalyticsFilterRoom[];
  onTimeframeChange: (value: AnalyticsTimeframe) => void;
  onPropertyChange: (slug: string) => void;
  onRoomChange: (roomId: string) => void;
}

const TIMEFRAMES: AnalyticsTimeframe[] = ["this_year", "last_year", "last_3_months"];

const TIMEFRAME_KEYS: Record<AnalyticsTimeframe, string> = {
  this_year: "owner.analytics.timeframe.thisYear",
  last_year: "owner.analytics.timeframe.lastYear",
  last_3_months: "owner.analytics.timeframe.last3Months",
};

export function AnalyticsFilterSkin({
  timeframe,
  propertySlug,
  roomId,
  properties,
  rooms,
  onTimeframeChange,
  onPropertyChange,
  onRoomChange,
}: AnalyticsFilterSkinProps) {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TIMEFRAMES.map((value) => {
          const active = timeframe === value;
          const label =
            value === "this_year"
              ? t(TIMEFRAME_KEYS[value] as Parameters<typeof t>[0], {
                  year: currentYear,
                })
              : t(TIMEFRAME_KEYS[value] as Parameters<typeof t>[0]);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onTimeframeChange(value)}
              className={`min-h-12 rounded-full border px-4 text-sm font-medium transition-colors ${
                active
                  ? "border-rc-green bg-rc-green text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-900">
            {t("owner.analytics.filter.property")}
          </span>
          <select
            value={propertySlug}
            onChange={(event) => onPropertyChange(event.target.value)}
            className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-900"
          >
            <option value="portfolio">{t("owner.analytics.filter.portfolio")}</option>
            {properties.map((property) => (
              <option key={property.id} value={property.slug}>
                {property.name}
              </option>
            ))}
          </select>
        </label>

        {propertySlug !== "portfolio" && rooms.length > 0 && (
          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-900">
              {t("owner.analytics.filter.room")}
            </span>
            <select
              value={roomId}
              onChange={(event) => onRoomChange(event.target.value)}
              className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-900"
            >
              <option value="">{t("owner.analytics.filter.allRooms")}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {t("common.room", { number: room.room_number })}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
}
