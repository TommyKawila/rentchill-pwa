"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { PREMIUM_PRICE_THB, TIER_ROOM_LIMITS } from "@/services/planLimits";

export function LandingRoomCalculatorSkin() {
  const { t } = useLocale();
  const [roomCount, setRoomCount] = useState(1);

  const tier = roomCount <= 1 ? "free" : "premium";
  const price = tier === "free" ? 0 : PREMIUM_PRICE_THB;
  const roomLimit = TIER_ROOM_LIMITS[tier];

  return (
    <div className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 p-6">
      <label htmlFor="room-calc" className="text-sm font-medium text-zinc-900">
        {t("landing.pricing.calculator.label")}
      </label>
      <input
        id="room-calc"
        type="number"
        min={1}
        max={99}
        value={roomCount}
        onChange={(e) => setRoomCount(Math.max(1, Number(e.target.value) || 1))}
        className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-base tabular-nums"
      />
      <div
        className={`mt-4 rounded-xl border p-6 ${
          tier === "premium"
            ? "border-rc-green-dark bg-rc-green text-white"
            : "border-rc-green/30 bg-white"
        }`}
      >
        <p
          className={`text-xs font-medium uppercase tracking-wide ${
            tier === "premium" ? "text-white/70" : "text-rc-green-ink"
          }`}
        >
          {t("landing.pricing.calculator.recommend")}
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold ${
                tier === "premium" ? "text-white" : "text-zinc-900"
              }`}
            >
              {t(`owner.plan.tier.${tier}`)}
            </p>
            <p
              className={`mt-1 text-sm ${
                tier === "premium" ? "text-white/80" : "text-zinc-500"
              }`}
            >
              {t("landing.pricing.rooms", { count: roomLimit })}
            </p>
          </div>
          <p
            className={`shrink-0 text-2xl font-bold tabular-nums ${
              tier === "premium" ? "text-white" : "text-zinc-900"
            }`}
          >
            {price === 0
              ? t("landing.pricing.free")
              : t("landing.pricing.perMonth", { price: String(price) })}
          </p>
        </div>
        {tier === "free" ? (
          <p className="mt-3 text-sm text-zinc-600">{t("landing.pricing.freeNote")}</p>
        ) : null}
        <a
          href={tier === "free" ? "/admin/signup" : "/admin/signup?plan=premium"}
          className={`mt-4 flex min-h-12 items-center justify-center rounded-lg px-4 py-2 text-center text-sm font-medium ${
            tier === "premium"
              ? "bg-white text-rc-green-ink hover:bg-rc-green-soft"
              : "border border-zinc-200 bg-white text-zinc-800"
          }`}
        >
          {t("landing.pricing.calculator.cta")}
        </a>
      </div>
    </div>
  );
}
