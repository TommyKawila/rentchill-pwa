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

const inputClass =
  "mt-2 min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

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
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-zinc-500">{t("settings.projectSlugPreview")}</p>
          {!isManual ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setIsManual(true);
                setManualSlug(suggestedSlug || currentSlug || "");
              }}
              className="inline-flex min-h-12 shrink-0 items-center text-base text-zinc-700 underline disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex min-h-12 shrink-0 items-center text-base text-zinc-700 underline disabled:cursor-not-allowed disabled:opacity-50"
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
            className={inputClass}
          />
        ) : (
          <p className="mt-1 break-all text-base font-medium text-zinc-800">
            {displaySlug ? `${appBase}/${displaySlug}` : "—"}
          </p>
        )}
      </div>

      {validationError && (
        <p className="text-sm text-red-600">
          {t(slugValidationMessageKey(validationError))}
        </p>
      )}

      {slugWillChange && !validationError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
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
