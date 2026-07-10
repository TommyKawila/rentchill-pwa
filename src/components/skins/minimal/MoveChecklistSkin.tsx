"use client";

import { useRef } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { DocumentType } from "@/services/planLimits";
import { canUseMoveChecklist } from "@/services/planLimits";
import type { PlanTier } from "@/services/propertyQuotaService";

interface MoveChecklistSkinProps {
  planTier: PlanTier;
  disabled?: boolean;
  busy?: boolean;
  onUpload: (docType: Extract<DocumentType, "move_in" | "move_out">, file: File) => void;
}

export function MoveChecklistSkin({
  planTier,
  disabled,
  busy,
  onUpload,
}: MoveChecklistSkinProps) {
  const { t } = useLocale();
  const moveInRef = useRef<HTMLInputElement>(null);
  const moveOutRef = useRef<HTMLInputElement>(null);

  if (!canUseMoveChecklist(planTier)) return null;

  const capture = (type: "move_in" | "move_out") => {
    if (type === "move_in") moveInRef.current?.click();
    else moveOutRef.current?.click();
  };

  return (
    <div className="space-y-2 rounded-md border border-zinc-100 bg-white px-3 py-3">
      <p className="text-xs font-medium text-zinc-700">{t("owner.moveChecklist.title")}</p>
      <ul className="space-y-1 text-[11px] text-zinc-500">
        <li>· {t("owner.moveChecklist.item.room")}</li>
        <li>· {t("owner.moveChecklist.item.meter")}</li>
        <li>· {t("owner.moveChecklist.item.keys")}</li>
      </ul>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => capture("move_in")}
          className="min-h-11 flex-1 rounded-md border border-zinc-200 bg-zinc-50 py-2 text-xs font-medium disabled:opacity-50"
        >
          {t("owner.moveChecklist.moveIn")}
        </button>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => capture("move_out")}
          className="min-h-11 flex-1 rounded-md border border-zinc-200 bg-zinc-50 py-2 text-xs font-medium disabled:opacity-50"
        >
          {t("owner.moveChecklist.moveOut")}
        </button>
      </div>
      <input
        ref={moveInRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload("move_in", file);
        }}
      />
      <input
        ref={moveOutRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onUpload("move_out", file);
        }}
      />
    </div>
  );
}
