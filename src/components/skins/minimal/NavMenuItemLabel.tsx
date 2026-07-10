"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface NavMenuItemLabelProps {
  icon: LucideIcon;
  children: ReactNode;
  active?: boolean;
}

export function NavMenuItemLabel({
  icon: Icon,
  children,
  active = false,
}: NavMenuItemLabelProps) {
  const tone = active
    ? "text-zinc-900"
    : "text-zinc-500 group-hover:text-zinc-900";

  return (
    <>
      <Icon className={`h-5 w-5 shrink-0 ${tone}`} strokeWidth={1.5} aria-hidden />
      <span className={`min-w-0 ${tone}`}>{children}</span>
    </>
  );
}
