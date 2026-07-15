"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import {
  isValidLineChatUrl,
  normalizeLineChatUrl,
  validateTechnicianContactsLineUrls,
} from "@/services/technicianLineService";
import type { PropertyPaymentInput, TechnicianContacts, TechnicianDept } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

const DEPTS: TechnicianDept[] = ["electrical", "plumbing", "internet"];

const DEPT_LABEL: Record<TechnicianDept, string> = {
  electrical: "settings.technician.dept.electrical",
  plumbing: "settings.technician.dept.plumbing",
  internet: "settings.technician.dept.internet",
};

type DeptForm = { display_name: string; phone: string; line_url: string };

function contactsToForm(contacts: TechnicianContacts): Record<TechnicianDept, DeptForm> {
  return {
    electrical: {
      display_name: contacts.electrical?.display_name ?? "",
      phone: contacts.electrical?.phone ?? "",
      line_url: contacts.electrical?.line_url ?? "",
    },
    plumbing: {
      display_name: contacts.plumbing?.display_name ?? "",
      phone: contacts.plumbing?.phone ?? "",
      line_url: contacts.plumbing?.line_url ?? "",
    },
    internet: {
      display_name: contacts.internet?.display_name ?? "",
      phone: contacts.internet?.phone ?? "",
      line_url: contacts.internet?.line_url ?? "",
    },
  };
}

function formToContacts(form: Record<TechnicianDept, DeptForm>): TechnicianContacts {
  const contacts: TechnicianContacts = {};
  for (const dept of DEPTS) {
    const display_name = form[dept].display_name.trim() || null;
    const phone = form[dept].phone.trim() || null;
    const line_url = normalizeLineChatUrl(form[dept].line_url);
    if (phone || line_url || display_name) {
      contacts[dept] = { phone, line_url, display_name };
    }
  }
  return contacts;
}

interface SettingsTechnicianModalSkinProps {
  contacts: TechnicianContacts;
  saving: boolean;
  onClose: () => void;
  onSave: (input: Pick<PropertyPaymentInput, "technician_contacts">) => Promise<boolean>;
}

export function SettingsTechnicianModalSkin({
  contacts: initialContacts,
  saving,
  onClose,
  onSave,
}: SettingsTechnicianModalSkinProps) {
  const { t } = useLocale();
  const [form, setForm] = useState(() => contactsToForm(initialContacts));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setForm(contactsToForm(initialContacts));
    setValidationError(null);
  }, [initialContacts]);

  const updateDept = (dept: TechnicianDept, field: keyof DeptForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [dept]: { ...prev[dept], [field]: value },
    }));
    setValidationError(null);
  };

  const handleSave = () => {
    const contactsPayload = formToContacts(form);
    const rawForValidation = Object.fromEntries(
      DEPTS.map((dept) => [dept, { line_url: form[dept].line_url }]),
    );
    if (!validateTechnicianContactsLineUrls(rawForValidation)) {
      setValidationError(t("settings.technician.lineInvalid"));
      return;
    }

    for (const dept of DEPTS) {
      const line = form[dept].line_url.trim();
      if (line && !isValidLineChatUrl(line)) {
        setValidationError(t("settings.technician.lineInvalid"));
        return;
      }
    }

    void onSave({ technician_contacts: contactsPayload }).then((ok) => {
      if (ok) onClose();
    });
  };

  return (
    <SettingsSectionModalShell
      title={t("settings.row.technician")}
      subtitle={t("settings.technician.desc")}
      onClose={onClose}
      saving={saving}
      onSave={handleSave}
    >
      <div className="space-y-6">
        {DEPTS.map((dept) => (
          <div
            key={dept}
            className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
          >
            <p className="text-base font-medium text-zinc-900">
              {t(DEPT_LABEL[dept] as Parameters<typeof t>[0])}
            </p>

            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">
                {t("settings.technician.displayName")}
              </span>
              <input
                value={form[dept].display_name}
                onChange={(event) =>
                  updateDept(dept, "display_name", event.target.value)
                }
                placeholder={t("settings.technician.displayNamePlaceholder")}
                className={inputClass}
              />
            </label>

            <label className="block space-y-1 text-sm text-zinc-500">
              <span className="font-medium text-zinc-900">
                {t("settings.technician.phone")}
              </span>
              <input
                value={form[dept].phone}
                onChange={(event) => updateDept(dept, "phone", event.target.value)}
                placeholder="0812345678"
                inputMode="numeric"
                className={inputClass}
              />
            </label>

            <div className="space-y-2">
              <span className="block text-sm font-medium text-zinc-900">
                {t("settings.technician.lineChat")}
              </span>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
                <li>{t("settings.technician.lineGuide.step1")}</li>
                <li>{t("settings.technician.lineGuide.step2")}</li>
                <li>{t("settings.technician.lineGuide.step3")}</li>
              </ol>
              <input
                value={form[dept].line_url}
                onChange={(event) => updateDept(dept, "line_url", event.target.value)}
                placeholder="https://line.me/ti/p/..."
                className={inputClass}
              />
            </div>
          </div>
        ))}

        <p className="text-sm text-zinc-500">{t("settings.technician.hint")}</p>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </SettingsSectionModalShell>
  );
}
