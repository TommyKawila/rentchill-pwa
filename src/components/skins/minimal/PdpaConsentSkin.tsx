"use client";

import { useState } from "react";

interface PdpaConsentSkinProps {
  tenantName: string;
  disabled?: boolean;
  onAccept: () => void;
}

export function PdpaConsentSkin({
  tenantName,
  disabled,
  onAccept,
}: PdpaConsentSkinProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
          PDPA
        </p>
        <h1 className="mt-2 text-lg font-semibold">ยินยอมการเก็บข้อมูล</h1>
        <p className="mt-2 text-sm text-zinc-600">
          สวัสดี {tenantName} — RentChill เก็บเบอร์โทรและประวัติการชำระเพื่อจัดการบิลค่าเช่าเท่านั้น
        </p>
      </header>

      <label className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-4 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1"
        />
        <span>
          ข้าพเจ้ายินยอมให้เก็บ ใช้ และเปิดเผยข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล
        </span>
      </label>

      <button
        type="button"
        disabled={disabled || !checked}
        onClick={onAccept}
        className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {disabled ? "กำลังบันทึก..." : "ยอมรับและเข้าใช้งาน"}
      </button>
    </div>
  );
}
