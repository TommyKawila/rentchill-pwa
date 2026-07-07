"use client";

import { useEffect, useState } from "react";

interface InviteCodeSkinProps {
  initialCode?: string;
  disabled?: boolean;
  error?: string | null;
  onSubmit: (code: string) => void;
}

export function InviteCodeSkin({
  initialCode = "",
  disabled,
  error,
  onSubmit,
}: InviteCodeSkinProps) {
  const [code, setCode] = useState(initialCode);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          ผูกห้อง
        </p>
        <h1 className="mt-2 text-lg font-semibold">ใส่รหัสเชิญจากเจ้าของหอ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          รหัสอยู่ในลิงก์หรือข้อความที่เจ้าของหอส่งให้
        </p>
      </header>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">รหัสเชิญ</span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="RCDEMO1"
          className="w-full rounded-md border border-zinc-200 px-3 py-2 uppercase"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={disabled || !code.trim()}
        onClick={() => onSubmit(code.trim())}
        className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {disabled ? "กำลังผูกห้อง..." : "ยืนยันผูกห้อง"}
      </button>
    </div>
  );
}
