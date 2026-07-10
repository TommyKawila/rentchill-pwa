"use client";

import type { ReactNode } from "react";
import { useEasyMode } from "@/components/EasyModeProvider";

type EasyModeCtaIconName =
  | "bill"
  | "meter"
  | "approve"
  | "reject"
  | "remind";

const paths: Record<EasyModeCtaIconName, ReactNode> = {
  bill: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 7h6M9 11h6M9 15h3M7 3h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z"
    />
  ),
  meter: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v5l3 2"
    />
  ),
  approve: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  ),
  reject: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  ),
  remind: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  ),
};

export function EasyModeCtaIcon({ name }: { name: EasyModeCtaIconName }) {
  const { easyMode } = useEasyMode();
  if (!easyMode) return null;

  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="mr-2 inline-block h-5 w-5 shrink-0 align-text-bottom"
    >
      {paths[name]}
    </svg>
  );
}
