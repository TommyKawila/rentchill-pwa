"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  isProjectSlugPayloadValid,
  ProjectSlugEditorSkin,
  type ProjectSlugPayload,
} from "@/components/skins/minimal/ProjectSlugEditorSkin";
import {
  normalizeManualSlug,
  slugValidationMessageKey,
} from "@/services/propertySlugUtils";
import type { MessageKey } from "@/services/i18n/messages";

interface ProjectManageSkinProps {
  propertyName: string;
  propertySlug: string;
  renaming: boolean;
  deleting: boolean;
  error: string | null;
  onRename: (name: string, manualSlug?: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

function formatSlugError(
  t: (key: MessageKey) => string,
  error: string | null,
) {
  if (!error) return null;
  if (
    error === "SLUG_TAKEN" ||
    error === "SLUG_FORMAT" ||
    error === "SLUG_LENGTH" ||
    error === "SLUG_RESERVED"
  ) {
    return t(slugValidationMessageKey(error));
  }
  return error;
}

function projectUrl(slug: string) {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${slug}`;
}

export function ProjectManageSkin({
  propertyName,
  propertySlug,
  renaming,
  deleting,
  error,
  onRename,
  onDelete,
}: ProjectManageSkinProps) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [name, setName] = useState(propertyName);
  const [confirmName, setConfirmName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [slugPayload, setSlugPayload] = useState<ProjectSlugPayload>({
    manualSlug: null,
  });
  const skipSlugResetRef = useRef(false);

  const handleSlugChange = useCallback((payload: ProjectSlugPayload) => {
    setSlugPayload(payload);
  }, []);

  const resetForm = useCallback(() => {
    setName(propertyName);
    setSlugPayload({ manualSlug: null });
    setShowDelete(false);
    setConfirmName("");
  }, [propertyName]);

  useEffect(() => {
    setName(propertyName);
  }, [propertyName]);

  useEffect(() => {
    if (skipSlugResetRef.current) {
      skipSlugResetRef.current = false;
      resetForm();
      return;
    }
    setExpanded(false);
    resetForm();
    setSavedFlash(false);
  }, [propertySlug, resetForm]);

  useEffect(() => {
    if (!savedFlash) return;
    const timer = window.setTimeout(() => setSavedFlash(false), 3000);
    return () => window.clearTimeout(timer);
  }, [savedFlash]);

  const nameChanged = name.trim() !== propertyName.trim();
  const normalizedManual = slugPayload.manualSlug
    ? normalizeManualSlug(slugPayload.manualSlug)
    : null;
  const slugChanged =
    normalizedManual !== null && normalizedManual !== propertySlug;
  const slugValid = isProjectSlugPayloadValid(slugPayload);
  const canSave = Boolean(name.trim()) && (nameChanged || slugChanged);

  const handleRename = async () => {
    if (!canSave || !slugValid) return;
    try {
      await onRename(name.trim(), slugPayload.manualSlug);
      skipSlugResetRef.current = true;
      setExpanded(false);
      resetForm();
      setSavedFlash(true);
    } catch {
      // keep panel open; error shown via props
    }
  };

  const handleClose = () => {
    setExpanded(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (confirmName.trim() !== propertyName.trim()) return;
    await onDelete();
  };

  if (!expanded) {
    return (
      <div className="mt-4 rounded-xl border border-zinc-100 bg-white p-6">
        <p className="text-base font-semibold text-zinc-900">{propertyName}</p>
        <p className="mt-1 break-all font-mono text-sm text-zinc-500">
          {projectUrl(propertySlug)}
        </p>
        {savedFlash && (
          <p className="mt-1 text-sm text-green-600">{t("settings.projectSaved")}</p>
        )}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 flex min-h-12 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white text-base font-medium text-zinc-700"
        >
          {t("settings.projectManageTitle")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-zinc-100 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{t("settings.projectManageTitle")}</h2>
        <button
          type="button"
          disabled={renaming || deleting}
          onClick={handleClose}
          className="inline-flex min-h-12 items-center text-base text-zinc-500 underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("owner.rooms.close")}
        </button>
      </div>

      <label className="mt-4 block space-y-1 text-sm text-zinc-500">
        <span className="font-medium text-zinc-900">{t("settings.projectRename")}</span>
        <input
          value={name}
          disabled={renaming || deleting}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
        />
      </label>

      <div className="mt-3">
        <ProjectSlugEditorSkin
          key={propertySlug}
          name={name}
          currentSlug={propertySlug}
          disabled={renaming || deleting}
          onChange={handleSlugChange}
        />
      </div>

      <button
        type="button"
        disabled={renaming || deleting || !canSave || !slugValid}
        onClick={() => void handleRename()}
        className="mt-3 flex min-h-14 w-full items-center justify-center rounded-lg bg-rc-green text-base font-medium text-white hover:bg-rc-green-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {renaming ? t("common.saving") : t("settings.projectRenameSave")}
      </button>

      <div className="mt-6 border-t border-zinc-100 pt-4">
        {!showDelete ? (
          <button
            type="button"
            disabled={renaming || deleting}
            onClick={() => setShowDelete(true)}
            className="flex min-h-12 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 text-base font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("settings.projectDelete")}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">{t("settings.projectDeleteHint")}</p>
            <input
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={propertyName}
              className={inputClass}
            />
            <div className="flex gap-3">
              <button
                type="button"
                disabled={
                  deleting ||
                  renaming ||
                  confirmName.trim() !== propertyName.trim()
                }
                onClick={() => void handleDelete()}
                className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-red-300 bg-white text-base font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? t("settings.projectDeleting") : t("settings.projectDeleteConfirm")}
              </button>
              <button
                type="button"
                disabled={deleting || renaming}
                onClick={() => {
                  setShowDelete(false);
                  setConfirmName("");
                }}
                className="flex min-h-12 items-center rounded-lg border border-zinc-200 px-4 text-base text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("owner.rooms.close")}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{formatSlugError(t, error)}</p>
      )}
    </div>
  );
}
