"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { SettingsSectionModalShell } from "@/components/skins/minimal/SettingsSectionModalShell";
import {
  formatBankAccount,
  parseBankAccount,
  validatePaymentAccountInput,
} from "@/services/bankAccountFormService";
import type { PropertyPaymentInput } from "@/services/types";

const inputClass =
  "min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900";

interface SettingsPaymentAccountModalSkinProps {
  promptPay: string;
  bankAccount: string;
  receiverName: string;
  saving: boolean;
  onClose: () => void;
  onSave: (input: Pick<
    PropertyPaymentInput,
    "prompt_pay" | "bank_account" | "receiver_name"
  >) => Promise<boolean>;
}

export function SettingsPaymentAccountModalSkin({
  promptPay: initialPromptPay,
  bankAccount: initialBankAccount,
  receiverName: initialReceiverName,
  saving,
  onClose,
  onSave,
}: SettingsPaymentAccountModalSkinProps) {
  const { t } = useLocale();
  const [promptPay, setPromptPay] = useState(initialPromptPay);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [receiverName, setReceiverName] = useState(initialReceiverName);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setPromptPay(initialPromptPay);
    const parsed = parseBankAccount(initialBankAccount);
    setBankName(parsed.bankName);
    setAccountNumber(parsed.accountNumber);
    setReceiverName(initialReceiverName);
    setValidationError(null);
  }, [initialPromptPay, initialBankAccount, initialReceiverName]);

  const handleSave = () => {
    const issue = validatePaymentAccountInput({
      bankName,
      accountNumber,
      receiverName,
    });
    if (issue === "receiver") {
      setValidationError(t("settings.receiverRequired"));
      return;
    }
    if (issue === "bankPair") {
      setValidationError(t("settings.bankPairRequired"));
      return;
    }
    setValidationError(null);

    void onSave({
      prompt_pay: promptPay,
      bank_account: formatBankAccount(bankName, accountNumber),
      receiver_name: receiverName.trim(),
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
      saveDisabled={saving}
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

        <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-900">{t("settings.bankSection")}</p>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("settings.bankName")}</span>
            <input
              value={bankName}
              onChange={(event) => {
                setBankName(event.target.value);
                setValidationError(null);
              }}
              placeholder={t("settings.bankNamePlaceholder")}
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm text-zinc-500">
            <span className="font-medium text-zinc-900">{t("settings.bankAccountNumber")}</span>
            <input
              value={accountNumber}
              onChange={(event) => {
                setAccountNumber(event.target.value);
                setValidationError(null);
              }}
              placeholder="5002021619"
              inputMode="numeric"
              className={inputClass}
            />
          </label>
        </div>

        <label className="block space-y-1 text-sm text-zinc-500">
          <span className="font-medium text-zinc-900">{t("settings.receiverName")}</span>
          <input
            value={receiverName}
            onChange={(event) => {
              setReceiverName(event.target.value);
              setValidationError(null);
            }}
            placeholder={t("settings.receiverPlaceholder")}
            required
            className={inputClass}
          />
          <p className="text-sm text-zinc-500">{t("settings.receiverRequiredHint")}</p>
        </label>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>
    </SettingsSectionModalShell>
  );
}
