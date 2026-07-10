"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";

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
    "flex min-h-11 w-full items-center rounded-lg px-3 py-2 text-left font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50";

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-medium text-zinc-700"
      >
        {t("owner.nav.tools")} ▾
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-zinc-100 bg-white p-1">
          <a href="/import" className={itemClass} onClick={() => setOpen(false)}>
            {t("owner.nav.import")}
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
              {csvLoading ? t("owner.csv.exporting") : t("owner.nav.csvExport")}
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
              {t("owner.nav.shareLink")}
            </button>
          )}
          <a
            href={`/${propertySlug}?from=owner`}
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            {t("owner.nav.projectPage")}
          </a>
          <a
            href={`/billing?property=${encodeURIComponent(propertySlug)}`}
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            {t("owner.nav.billing")}
          </a>
        </div>
      )}
    </div>
  );
}
