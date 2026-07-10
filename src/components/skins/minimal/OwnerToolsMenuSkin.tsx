"use client";

import {
  Building2,
  CreditCard,
  Download,
  FileSpreadsheet,
  Share2,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { NavMenuItemLabel } from "@/components/skins/minimal/NavMenuItemLabel";

interface OwnerToolsMenuSkinProps {
  propertySlug: string;
  onExportCsv?: () => void;
  csvDisabled?: boolean;
  csvLoading?: boolean;
  onOpenShareLink?: () => void;
  shareDisabled?: boolean;
}

export function OwnerToolsMenuSkin({
  propertySlug,
  onExportCsv,
  csvDisabled,
  csvLoading,
  onOpenShareLink,
  shareDisabled,
}: OwnerToolsMenuSkinProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass =
    "group flex min-h-11 w-full items-center gap-x-3 rounded-lg px-3 py-2 text-left font-medium hover:bg-zinc-50 disabled:opacity-50";

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="group flex min-h-11 w-full items-center justify-center gap-x-3 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-medium"
      >
        <NavMenuItemLabel icon={Wrench}>{t("owner.nav.tools")}</NavMenuItemLabel>
        <span className="text-zinc-500 group-hover:text-zinc-900" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-zinc-100 bg-white p-1">
          <a href="/import" className={itemClass} onClick={() => setOpen(false)}>
            <NavMenuItemLabel icon={FileSpreadsheet}>
              {t("owner.nav.import")}
            </NavMenuItemLabel>
          </a>
          {onExportCsv && (
            <button
              type="button"
              disabled={csvDisabled || csvLoading}
              onClick={() => {
                onExportCsv();
                setOpen(false);
              }}
              className={itemClass}
            >
              <NavMenuItemLabel icon={Download}>
                {csvLoading ? t("owner.csv.exporting") : t("owner.nav.csvExport")}
              </NavMenuItemLabel>
            </button>
          )}
          {onOpenShareLink && (
            <button
              type="button"
              disabled={shareDisabled}
              onClick={() => {
                onOpenShareLink();
                setOpen(false);
              }}
              className={itemClass}
            >
              <NavMenuItemLabel icon={Share2}>
                {t("owner.nav.shareLink")}
              </NavMenuItemLabel>
            </button>
          )}
          <a
            href={`/${propertySlug}?from=owner`}
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            <NavMenuItemLabel icon={Building2}>
              {t("owner.nav.projectPage")}
            </NavMenuItemLabel>
          </a>
          <a
            href={`/billing?property=${encodeURIComponent(propertySlug)}`}
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            <NavMenuItemLabel icon={CreditCard}>
              {t("owner.nav.billing")}
            </NavMenuItemLabel>
          </a>
        </div>
      )}
    </div>
  );
}
