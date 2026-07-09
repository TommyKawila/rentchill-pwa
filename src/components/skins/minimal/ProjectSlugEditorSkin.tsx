"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  autoSlugFromName,
  normalizeManualSlug,
  slugValidationMessageKey,
  validateManualSlug,
} from "@/services/propertySlugUtils";

export type ProjectSlugPayload = {
  manualSlug: string | null;
};

interface ProjectSlugEditorSkinProps {
  name: string;
  currentSlug?: string;
  disabled?: boolean;
  onChange: (payload: ProjectSlugPayload) => void;
}

export function ProjectSlugEditorSkin({
  name,
  currentSlug,
  disabled,
  onChange,
}: ProjectSlugEditorSkinProps) {
  const { t } = useLocale();
  const [isManual, setIsManual] = useState(false);
  const [manualSlug, setManualSlug] = useState(currentSlug ?? "");

  const suggestedSlug = useMemo(() => autoSlugFromName(name), [name]);
  const displaySlug = isManual
    ? normalizeManualSlug(manualSlug)
    : suggestedSlug || currentSlug || "";

  const validationError = isManual ? validateManualSlug(manualSlug) : null;

  useEffect(() => {
    onChange({
      manualSlug: isManual && manualSlug.trim() ? manualSlug.trim() : null,
    });
  }, [isManual, manualSlug, onChange]);

  const appBase =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  const slugWillChange =
    Boolean(currentSlug) && displaySlug && displaySlug !== currentSlug;

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs">
        <div className="flex items-start justify-between gap-2">
          <p className="text-zinc-500">{t("settings.projectSlugPreview")}</p>
          {!isManual ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsManual(true);
                setManualSlug(suggestedSlug || currentSlug || "");
              }}
              className="shrink-0 text-zinc-700 underline disabled:opacity-50"
            >
              {t("settings.projectSlugEdit")}
            </button>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsManual(false);
                setManualSlug("");
              }}
              className="shrink-0 text-zinc-700 underline disabled:opacity-50"
            >
              {t("settings.projectSlugUseSuggested")}
            </button>
          )}
        </div>
        {isManual ? (
          <input
            value={manualSlug}
            disabled={disabled}
            onChange={(event) => setManualSlug(event.target.value)}
            placeholder="samui-rent"
            className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        ) : (
          <p className="mt-1 break-all font-medium text-zinc-800">
            {displaySlug ? `${appBase}/${displaySlug}` : "—"}
          </p>
        )}
      </div>

      {validationError && (
        <p className="text-xs text-red-700">
          {t(slugValidationMessageKey(validationError))}
        </p>
      )}

      {slugWillChange && !validationError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t("settings.projectSlugWarning")}
        </p>
      )}
    </div>
  );
}

export function isProjectSlugPayloadValid(payload: ProjectSlugPayload) {
  if (!payload.manualSlug) return true;
  return validateManualSlug(payload.manualSlug) === null;
}
