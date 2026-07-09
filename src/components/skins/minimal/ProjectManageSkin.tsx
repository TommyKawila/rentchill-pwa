"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  isProjectSlugPayloadValid,
  ProjectSlugEditorSkin,
  type ProjectSlugPayload,
} from "@/components/skins/minimal/ProjectSlugEditorSkin";
import { slugValidationMessageKey } from "@/services/propertySlugUtils";
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
  const [name, setName] = useState(propertyName);
  const [confirmName, setConfirmName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [slugPayload, setSlugPayload] = useState<ProjectSlugPayload>({
    manualSlug: null,
  });

  const handleSlugChange = useCallback((payload: ProjectSlugPayload) => {
    setSlugPayload(payload);
  }, []);

  useEffect(() => {
    setName(propertyName);
  }, [propertyName]);

  const nameChanged = name.trim() !== propertyName.trim();
  const slugValid = isProjectSlugPayloadValid(slugPayload);
  const canSave = name.trim() && (nameChanged || slugPayload.manualSlug !== null);

  const handleRename = async () => {
    if (!canSave || !slugValid) return;
    await onRename(name.trim(), slugPayload.manualSlug);
  };

  const handleDelete = async () => {
    if (confirmName.trim() !== propertyName.trim()) return;
    await onDelete();
  };

  return (
    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold">{t("settings.projectManageTitle")}</h2>

      <label className="mt-4 block space-y-1 text-sm">
        <span className="font-medium">{t("settings.projectRename")}</span>
        <input
          value={name}
          disabled={renaming || deleting}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
        />
      </label>

      <div className="mt-3">
        <ProjectSlugEditorSkin
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
        className="mt-3 w-full rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {renaming ? t("common.saving") : t("settings.projectRenameSave")}
      </button>

      <div className="mt-6 border-t border-zinc-100 pt-4">
        {!showDelete ? (
          <button
            type="button"
            disabled={renaming || deleting}
            onClick={() => setShowDelete(true)}
            className="w-full rounded-lg border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-700 disabled:opacity-50"
          >
            {t("settings.projectDelete")}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500">{t("settings.projectDeleteHint")}</p>
            <input
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={propertyName}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  deleting ||
                  renaming ||
                  confirmName.trim() !== propertyName.trim()
                }
                onClick={() => void handleDelete()}
                className="flex-1 rounded-lg border border-red-300 bg-white py-3 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="rounded-lg border border-zinc-300 px-3 py-3 text-sm text-zinc-700"
              >
                {t("owner.rooms.close")}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-700">{formatSlugError(t, error)}</p>
      )}
    </div>
  );
}
