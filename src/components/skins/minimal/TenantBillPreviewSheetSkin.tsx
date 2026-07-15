"use client";

import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { InvoiceSkin } from "@/components/skins/minimal/InvoiceSkin";
import type { Invoice } from "@/services/types";
import type { MeterPhotoRow } from "@/services/meterPhotoService";

interface TenantBillPreviewSheetSkinProps {
  open: boolean;
  invoice: Invoice;
  tenantName: string;
  roomNumber: string;
  meterPhotos?: MeterPhotoRow[];
  onClose: () => void;
}

export function TenantBillPreviewSheetSkin({
  open,
  invoice,
  tenantName,
  roomNumber,
  meterPhotos = [],
  onClose,
}: TenantBillPreviewSheetSkinProps) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("owner.rooms.close")}
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-bill-preview-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-t-xl border border-zinc-100 bg-white sm:rounded-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
          <h2
            id="tenant-bill-preview-title"
            className="text-base font-semibold tracking-tight text-zinc-900"
          >
            {t("owner.invoice.viewBill")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700"
          >
            {t("owner.rooms.close")}
          </button>
        </header>

        <div className="overflow-y-auto">
          <InvoiceSkin
            invoice={invoice}
            tenantName={tenantName}
            roomNumber={roomNumber}
            meterPhotos={meterPhotos}
            ownerPreview
          />
        </div>
      </div>
    </div>
  );
}
