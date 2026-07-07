"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePropertyPaymentSettings } from "@/hooks/usePropertyPaymentSettings";

function SettingsContent() {
  const searchParams = useSearchParams();
  const propertySlug = searchParams.get("property") ?? "demo-apartment";
  const { account, status, error, save } = usePropertyPaymentSettings(propertySlug);

  const [promptPay, setPromptPay] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [receiverName, setReceiverName] = useState("");

  useEffect(() => {
    if (!account) return;
    setPromptPay(account.prompt_pay ?? "");
    setBankAccount(account.bank_account ?? "");
    setReceiverName(account.receiver_name ?? "");
  }, [account]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            ตั้งค่าหอพัก
          </p>
          <h1 className="mt-2 text-2xl font-bold">บัญชีรับเงิน</h1>
          <p className="mt-2 text-sm text-zinc-600">
            {account?.property_name ?? propertySlug}
          </p>
        </header>

        <section className="mt-8 space-y-4">
          <p className="text-sm text-zinc-600">
            ใช้ตรวจสอบสลิปอัตโนมัติ — ถ้าไม่ตั้งค่า ระบบจะเช็คแค่ยอดเงิน
          </p>

          {status === "loading" && (
            <p className="text-sm text-zinc-500">กำลังโหลด...</p>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-medium">PromptPay / เบอร์โทร</span>
            <input
              value={promptPay}
              onChange={(event) => setPromptPay(event.target.value)}
              placeholder="0812345678"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">เลขบัญชีธนาคาร</span>
            <input
              value={bankAccount}
              onChange={(event) => setBankAccount(event.target.value)}
              placeholder="123-4-56789-0"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">ชื่อผู้รับ (ไม่บังคับ)</span>
            <input
              value={receiverName}
              onChange={(event) => setReceiverName(event.target.value)}
              placeholder="นายสมชาย ใจดี"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
            />
          </label>

          <button
            type="button"
            disabled={status === "loading" || status === "saving"}
            onClick={() =>
              void save({
                prompt_pay: promptPay,
                bank_account: bankAccount,
                receiver_name: receiverName,
              })
            }
            className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "saving" ? "กำลังบันทึก..." : "บันทึกบัญชีรับเงิน"}
          </button>

          <a
            href={`/dashboard?property=${encodeURIComponent(propertySlug)}`}
            className="block text-center text-sm text-zinc-600 underline"
          >
            กลับแดชบอร์ด
          </a>
        </section>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          กำลังโหลด...
        </main>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
