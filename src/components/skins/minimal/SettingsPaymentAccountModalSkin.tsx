"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import {
  formatBankAccount,
  parseBankAccount,
  validatePaymentAccountInput,
} from "@/services/bankAccountFormService";
import {
  createBankAccountId,
  summarizeBankAccount,
} from "@/services/propertyBankAccountService";
import type { PropertyBankAccount, PropertyPaymentInput } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface SettingsPaymentAccountModalSkinProps {
  promptPay: string;
  bankAccounts: PropertyBankAccount[];
  activeBankAccountId: string | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: Pick<
    PropertyPaymentInput,
    "prompt_pay" | "bank_accounts" | "active_bank_account_id"
  >) => Promise<boolean>;
}

type EditorMode = { kind: "new" } | { kind: "edit"; id: string };

function emptyForm() {
  return { bankName: "", accountNumber: "", receiverName: "" };
}

export function SettingsPaymentAccountModalSkin({
  promptPay: initialPromptPay,
  bankAccounts: initialBankAccounts,
  activeBankAccountId: initialActiveBankAccountId,
  saving,
  onClose,
  onSave,
}: SettingsPaymentAccountModalSkinProps) {
  const { t } = useLocale();
  const [promptPay, setPromptPay] = useState(initialPromptPay);
  const [accounts, setAccounts] = useState<PropertyBankAccount[]>(initialBankAccounts);
  const [activeId, setActiveId] = useState<string | null>(initialActiveBankAccountId);
  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setPromptPay(initialPromptPay);
    setAccounts(initialBankAccounts);
    setActiveId(initialActiveBankAccountId);
    setEditor(null);
    setForm(emptyForm());
    setValidationError(null);
  }, [initialPromptPay, initialBankAccounts, initialActiveBankAccountId]);

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) => {
        if (a.id === activeId) return -1;
        if (b.id === activeId) return 1;
        return 0;
      }),
    [accounts, activeId],
  );

  const openNewEditor = () => {
    setEditor({ kind: "new" });
    setForm(emptyForm());
    setValidationError(null);
  };

  const openEditEditor = (entry: PropertyBankAccount) => {
    const parsed = parseBankAccount(entry.bank_account);
    setEditor({ kind: "edit", id: entry.id });
    setForm({
      bankName: parsed.bankName,
      accountNumber: parsed.accountNumber,
      receiverName: entry.receiver_name,
    });
    setValidationError(null);
  };

  const closeEditor = () => {
    setEditor(null);
    setForm(emptyForm());
    setValidationError(null);
  };

  const applyEditor = (): PropertyBankAccount[] | null => {
    const issue = validatePaymentAccountInput({
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      receiverName: form.receiverName,
    });
    if (issue === "receiver") {
      setValidationError(t("settings.receiverRequired"));
      return null;
    }
    if (issue === "bankPair") {
      setValidationError(t("settings.bankPairRequired"));
      return null;
    }

    const bank_account = formatBankAccount(form.bankName, form.accountNumber) ?? "";
    const nextEntry: PropertyBankAccount = {
      id: editor?.kind === "edit" ? editor.id : createBankAccountId(),
      bank_account,
      receiver_name: form.receiverName.trim(),
      label: null,
    };

    if (editor?.kind === "edit") {
      return accounts.map((entry) => (entry.id === editor.id ? nextEntry : entry));
    }

    return [...accounts, nextEntry];
  };

  const handleSaveEditor = () => {
    const nextAccounts = applyEditor();
    if (!nextAccounts) return;
    setAccounts(nextAccounts);
    if (editor?.kind === "new") {
      setActiveId(nextAccounts[nextAccounts.length - 1]?.id ?? null);
    } else if (!activeId) {
      setActiveId(nextAccounts[0]?.id ?? null);
    }
    closeEditor();
  };

  const handleDelete = (id: string) => {
    const nextAccounts = accounts.filter((entry) => entry.id !== id);
    setAccounts(nextAccounts);
    if (activeId === id) {
      setActiveId(nextAccounts[0]?.id ?? null);
    }
    if (editor?.kind === "edit" && editor.id === id) closeEditor();
  };

  const handleSave = () => {
    if (accounts.length === 0) {
      void onSave({
        prompt_pay: promptPay,
        bank_accounts: [],
        active_bank_account_id: null,
      }).then((ok) => {
        if (ok) onClose();
      });
      return;
    }

    if (!activeId || !accounts.some((entry) => entry.id === activeId)) {
      setValidationError(t("settings.activeBankRequired"));
      return;
    }

    for (const entry of accounts) {
      const parsed = parseBankAccount(entry.bank_account);
      const issue = validatePaymentAccountInput({
        bankName: parsed.bankName,
        accountNumber: parsed.accountNumber,
        receiverName: entry.receiver_name,
      });
      if (issue === "receiver") {
        setValidationError(t("settings.receiverRequired"));
        return;
      }
      if (issue === "bankPair") {
        setValidationError(t("settings.bankPairRequired"));
        return;
      }
    }

    setValidationError(null);
    void onSave({
      prompt_pay: promptPay,
      bank_accounts: accounts,
      active_bank_account_id: activeId,
    }).then((ok) => {
      if (ok) onClose();
    });
  };

  return (
    <SettingsSectionModalShell
      title={t("settings.row.paymentAccount")}
      subtitle={t("settings.desc")}
      onClose={onClose}
      saving={saving}
      saveDisabled={saving || Boolean(editor)}
      onSave={handleSave}
    >
      <div className="space-y-4">
        <label className="block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("settings.promptPay")}</span>
          <input
            value={promptPay}
            onChange={(event) => setPromptPay(event.target.value)}
            placeholder="0812345678"
            inputMode="numeric"
            className={inputClass}
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-900">{t("settings.bankAccountsTitle")}</p>
            {!editor && (
              <button
                type="button"
                onClick={openNewEditor}
                className="inline-flex min-h-12 items-center gap-1 text-sm font-medium text-rc-green-ink"
              >
                <Plus className="h-4 w-4" aria-hidden />
                {t("settings.addBankAccount")}
              </button>
            )}
          </div>
          <p className="text-sm text-zinc-500">{t("settings.activeBankHint")}</p>

          {sortedAccounts.length === 0 && !editor ? (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              {t("settings.bankAccountsEmpty")}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAccounts.map((entry) => {
                const selected = entry.id === activeId;
                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-3 transition ${
                      selected
                        ? "border-rc-green bg-rc-green-soft/60"
                        : "border-zinc-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveId(entry.id)}
                        className="mt-1 flex min-h-10 min-w-10 items-center justify-center rounded-full border border-zinc-200 bg-white"
                        aria-label={t("settings.useForBilling")}
                        aria-pressed={selected}
                      >
                        <span
                          className={`h-4 w-4 rounded-full ${
                            selected ? "bg-rc-green" : "bg-transparent"
                          }`}
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <Building2
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              selected ? "text-rc-green-ink" : "text-zinc-400"
                            }`}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900">
                              {summarizeBankAccount(entry)}
                            </p>
                            {selected ? (
                              <p className="mt-1 text-xs font-medium text-rc-green-ink">
                                {t("settings.useForBilling")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEditEditor(entry)}
                          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50"
                          aria-label={t("settings.row.edit")}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          aria-label={t("settings.deleteBankAccount")}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {editor ? (
            <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-900">
                {editor.kind === "new"
                  ? t("settings.addBankAccount")
                  : t("settings.editBankAccount")}
              </p>
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">{t("settings.bankName")}</span>
                <input
                  value={form.bankName}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, bankName: event.target.value }));
                    setValidationError(null);
                  }}
                  placeholder={t("settings.bankNamePlaceholder")}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">
                  {t("settings.bankAccountNumber")}
                </span>
                <input
                  value={form.accountNumber}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, accountNumber: event.target.value }));
                    setValidationError(null);
                  }}
                  placeholder="5002021619"
                  inputMode="numeric"
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">{t("settings.receiverName")}</span>
                <input
                  value={form.receiverName}
                  onChange={(event) => {
                    setForm((prev) => ({ ...prev, receiverName: event.target.value }));
                    setValidationError(null);
                  }}
                  placeholder={t("settings.receiverPlaceholder")}
                  required
                  className={inputClass}
                />
                <p className="text-sm text-zinc-500">{t("settings.receiverRequiredHint")}</p>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveEditor}
                  className="min-h-12 flex-1 rounded-lg bg-rc-green px-4 text-sm font-medium text-white"
                >
                  {editor.kind === "new"
                    ? t("settings.addBankAccount")
                    : t("settings.formSave")}
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="min-h-12 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700"
                >
                  {t("settings.formCancel")}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </SettingsSectionModalShell>
  );
}
