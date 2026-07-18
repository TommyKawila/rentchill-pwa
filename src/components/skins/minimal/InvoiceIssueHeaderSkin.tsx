"use client";

import Image from "next/image";
import { ArrowLeft, Building2 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";

interface InvoiceIssueHeaderSkinProps {
  propertyName: string;
  roomNumber: string;
  tenantName: string;
  coverUrl?: string | null;
  onBack: () => void;
}

export function InvoiceIssueHeaderSkin({
  propertyName,
  roomNumber,
  tenantName,
  coverUrl,
  onBack,
}: InvoiceIssueHeaderSkinProps) {
  const { t } = useLocale();

  return (
    <header className="space-y-3">
      <div className="flex min-h-10 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("common.backToDashboard")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-rc-text hover:bg-zinc-100"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-rc-text">
          {t("owner.invoiceGen.title")}
        </h1>
        <span className="w-10 shrink-0" aria-hidden />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-zinc-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-zinc-400">
              <Building2 className="h-4 w-4" aria-hidden />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-rc-text">
            {propertyName} - {t("common.room", { number: roomNumber })}
          </p>
          <p className="truncate text-sm text-zinc-500">
            {t("owner.invoiceGen.tenantContext", { name: tenantName.trim() || "—" })}
          </p>
        </div>
      </div>
    </header>
  );
}
