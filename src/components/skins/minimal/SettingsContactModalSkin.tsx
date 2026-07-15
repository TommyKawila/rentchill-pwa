"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { ContactLineQrSkin } from "@/components/skins/minimal/ContactLineQrSkin";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import type { PropertyPaymentInput } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface SettingsContactModalSkinProps {
  propertySlug: string;
  contactLineUrl: string;
  contactLineQrUrl: string;
  contactPhone: string;
  saving: boolean;
  onClose: () => void;
  onSave: (input: Pick<
    PropertyPaymentInput,
    "contact_line_url" | "contact_line_qr_url" | "contact_phone"
  >) => Promise<boolean>;
  onQrRemove: () => void;
}

export function SettingsContactModalSkin({
  propertySlug,
  contactLineUrl: initialLineUrl,
  contactLineQrUrl: initialQrUrl,
  contactPhone: initialPhone,
  saving,
  onClose,
  onSave,
  onQrRemove,
}: SettingsContactModalSkinProps) {
  const { t } = useLocale();
  const [contactLineUrl, setContactLineUrl] = useState(initialLineUrl);
  const [contactLineQrUrl, setContactLineQrUrl] = useState(initialQrUrl);
  const [contactPhone, setContactPhone] = useState(initialPhone);

  useEffect(() => {
    setContactLineUrl(initialLineUrl);
    setContactLineQrUrl(initialQrUrl);
    setContactPhone(initialPhone);
  }, [initialLineUrl, initialQrUrl, initialPhone]);

  return (
    <SettingsSectionModalShell
      title={t("settings.contactTitle")}
      subtitle={t("settings.contactDesc")}
      onClose={onClose}
      saving={saving}
      onSave={() =>
        void onSave({
          contact_line_url: contactLineUrl,
          contact_line_qr_url: contactLineQrUrl || null,
          contact_phone: contactPhone,
        }).then((ok) => {
          if (ok) onClose();
        })
      }
    >
      <div className="space-y-4">
        <label className="block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("settings.contactLineUrl")}</span>
          <input
            value={contactLineUrl}
            onChange={(event) => setContactLineUrl(event.target.value)}
            placeholder="https://line.me/ti/p/..."
            className={inputClass}
          />
          <p className="text-sm text-zinc-500">{t("settings.contactLineUrlHint")}</p>
        </label>

        <ContactLineQrSkin
          propertySlug={propertySlug}
          qrUrl={contactLineQrUrl || null}
          onUploaded={setContactLineQrUrl}
          onRemove={onQrRemove}
        />

        <label className="block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("settings.contactPhone")}</span>
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="0812345678"
            inputMode="numeric"
            className={inputClass}
          />
        </label>
      </div>
    </SettingsSectionModalShell>
  );
}
