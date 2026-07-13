"use client";

import { UserRound } from "lucide-react";

interface TenantPersonIconProps {
  className?: string;
}

export function TenantPersonIcon({ className }: TenantPersonIconProps) {
  return <UserRound className={className} strokeWidth={1.5} aria-hidden />;
}
