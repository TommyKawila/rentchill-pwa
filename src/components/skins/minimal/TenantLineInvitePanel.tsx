"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { RoomInviteQrSkin } from "@/components/skins/minimal/RoomInviteQrSkin";

interface TenantLineInvitePanelProps {
  tenantName: string;
  roomNumber: string;
  inviteCode: string;
  inviteUrl: string;
  lineLinked: boolean;
  className?: string;
}

function fullInviteUrl(url: string) {
  if (url.startsWith("http")) return url;
  if (typeof window === "undefined") return url;
  return new URL(url, window.location.origin).href;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("copy failed");
}

export function TenantLineInvitePanel({
  tenantName,
  roomNumber,
  inviteCode,
  inviteUrl,
  lineLinked,
  className = "",
}: TenantLineInvitePanelProps) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const resolvedUrl = fullInviteUrl(inviteUrl);

  if (lineLinked || !inviteUrl) return null;

  if (!expanded) {
    return (
      <div className={`rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-amber-700">
              {t("owner.billing.lineNotLinked")}
            </p>
            <p className="mt-0.5 text-zinc-600">
              {t("owner.billing.lineInviteRequired")}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={false}
            onClick={() => setExpanded(true)}
            className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-medium text-zinc-700"
          >
            {t("owner.billing.inviteHowTo")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-3 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-amber-700">
            {t("owner.billing.lineNotLinked")}
          </p>
          <p className="mt-0.5 text-zinc-600">
            {t("owner.billing.lineInviteRequired")}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={true}
          onClick={() => setExpanded(false)}
          className="shrink-0 text-zinc-500 underline"
        >
          {t("owner.billing.inviteCollapse")}
        </button>
      </div>

      <p className="mt-3 text-zinc-500">
        {t("owner.billing.inviteCode")}:{" "}
        <span className="font-mono font-medium text-zinc-800">
          {inviteCode || "-"}
        </span>
      </p>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            setCopyError(null);
            void copyText(resolvedUrl)
              .then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              })
              .catch(() => setCopyError(t("owner.billing.copyFailed")));
          }}
          className="flex-1 rounded-lg border border-zinc-200 bg-white py-2.5 font-medium text-zinc-800"
        >
          {copied ? t("owner.billing.copied") : t("owner.billing.copyInvite")}
        </button>
        {canShare && (
          <button
            type="button"
            onClick={() => {
              setCopyError(null);
              void navigator
                .share({
                  title: "RentChill",
                  text: tenantName,
                  url: resolvedUrl,
                })
                .catch(() => setCopyError(t("owner.billing.copyFailed")));
            }}
            className="flex-1 rounded-lg border border-zinc-200 bg-white py-2.5 font-medium text-zinc-800"
          >
            {t("owner.billing.shareInvite")}
          </button>
        )}
      </div>

      <RoomInviteQrSkin
        roomNumber={roomNumber}
        tenantName={tenantName}
        inviteUrl={resolvedUrl}
      />

      {copyError && (
        <p className="mt-2 text-amber-800">{copyError}</p>
      )}
    </div>
  );
}
