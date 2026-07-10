"use client";

import { UserRound } from "lucide-react";
import type { TenantGender } from "@/services/tenantTitleUtils";

interface TenantPersonIconProps {
  gender: TenantGender;
  className?: string;
}

function TenantFemaleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M8.5 6.5c.8-1.2 2-1.8 3.5-1.8s2.7.6 3.5 1.8" />
      <path d="M7.5 19c1.5-2.5 7.5-2.5 9 0" />
    </svg>
  );
}

export function TenantPersonIcon({ gender, className }: TenantPersonIconProps) {
  if (gender === "female") {
    return <TenantFemaleIcon className={className} />;
  }

  return <UserRound className={className} strokeWidth={1.5} aria-hidden />;
}
