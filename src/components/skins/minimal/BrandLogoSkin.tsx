"use client";

import Image from "next/image";
import { BRAND_LOGO_SRC, BRAND_NAME } from "@/config/brand";

interface BrandLogoSkinProps {
  size?: "sm" | "md";
  showWordmark?: boolean;
}

const SIZES = {
  sm: { img: 24, className: "h-6 w-6" },
  md: { img: 32, className: "h-8 w-8" },
} as const;

export function BrandLogoSkin({ size = "md", showWordmark = true }: BrandLogoSkinProps) {
  const { img, className } = SIZES[size];

  return (
    <div className="flex items-center gap-2">
      <Image
        src={BRAND_LOGO_SRC}
        alt={BRAND_NAME}
        width={img}
        height={img}
        className={`${className} shrink-0 object-contain`}
        priority={size === "md"}
      />
      {showWordmark && (
        <span className="text-base font-bold tracking-tight text-zinc-900">{BRAND_NAME}</span>
      )}
    </div>
  );
}
