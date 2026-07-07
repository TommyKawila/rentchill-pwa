"use client";

import { useState } from "react";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";

interface OverrideSkinProps {
  invoice: InvoiceOverrideRow;
  disabled?: boolean;
  onSaveMeters: (waterUnit: number, electricUnit: number) => void;
  onAutoVerify: () => void;
  onReject: (note?: string) => void;
  onApprove: (slipUrl?: string) => void;
}

export function OverrideSkin({
  invoice,
  disabled,
  onSaveMeters,
  onAutoVerify,
  onReject,
  onApprove,
}: OverrideSkinProps) {
  const [waterUnit, setWaterUnit] = useState(String(invoice.water_unit));
  const [electricUnit, setElectricUnit] = useState(String(invoice.electric_unit));
  const [slipUrl, setSlipUrl] = useState(invoice.slip_image_url ?? "");
  const [rejectNote, setRejectNote] = useState(
    "สลิปไม่ตรงกับยอดแจ้งชำระ กรุณาส่งใหม่",
  );

  const hasSlip = Boolean(slipUrl);
  const isScanning = invoice.status === "scanning";
  const hasRejection = Boolean(invoice.slip_rejection_note?.trim());

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4">
      <header className="border-b border-zinc-100 pb-3">
        <p className="text-sm font-semibold">{invoice.tenant_name}</p>
        <p className="text-xs text-zinc-500">
          ห้อง {invoice.room_number} · {invoice.billing_month} · {invoice.status}
        </p>
      </header>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-zinc-500">น้ำ (หน่วย)</span>
          <input
            type="number"
            min={0}
            value={waterUnit}
            onChange={(event) => setWaterUnit(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-zinc-500">ไฟ (หน่วย)</span>
          <input
            type="number"
            min={0}
            value={electricUnit}
            onChange={(event) => setElectricUnit(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
      </div>

      <p className="mt-3 text-sm font-medium">
        รวม ฿{invoice.total_amount.toLocaleString("th-TH")}
      </p>

      {hasRejection && invoice.status === "pending" && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {invoice.slip_rejection_note}
        </div>
      )}

      {isScanning && hasSlip && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          สลิปรอตรวจสอบ — กดตรวจสอบอัตโนมัติ หรือปฏิเสธหากยอดไม่ตรง
        </p>
      )}

      {hasSlip && (
        <div className="mt-3">
          <p className="text-xs text-zinc-500">สลิปที่ลูกบ้านส่ง</p>
          <a href={slipUrl} target="_blank" rel="noreferrer" className="mt-1 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slipUrl}
              alt="Payment slip"
              className="max-h-48 w-full rounded-md border border-zinc-200 object-contain"
            />
          </a>
        </div>
      )}

      <label className="mt-3 block space-y-1 text-sm">
        <span className="text-zinc-500">ลิงก์สลิป (optional)</span>
        <input
          type="url"
          value={slipUrl}
          onChange={(event) => setSlipUrl(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-zinc-200 px-3 py-2"
        />
      </label>

      {isScanning && hasSlip && (
        <label className="mt-3 block space-y-1 text-sm">
          <span className="text-zinc-500">ข้อความแจ้งลูกบ้าน (เมื่อปฏิเสธ)</span>
          <input
            type="text"
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
          />
        </label>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onSaveMeters(Number(waterUnit), Number(electricUnit))
          }
          className="rounded-md border border-zinc-300 py-2 text-sm font-medium disabled:opacity-50"
        >
          บันทึกมิเตอร์
        </button>

        {isScanning && hasSlip && (
        <>
            <button
              type="button"
              disabled={disabled}
              onClick={onAutoVerify}
              className="rounded-md border border-green-600 bg-green-50 py-2 text-sm font-medium text-green-800 disabled:opacity-50"
            >
              ตรวจสอบอัตโนมัติ
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onReject(rejectNote)}
              className="rounded-md border border-red-300 bg-red-50 py-2 text-sm font-medium text-red-700 disabled:opacity-50"
            >
              ปฏิเสธสลิป / แจ้งส่งใหม่
            </button>
          </>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => onApprove(slipUrl || undefined)}
          className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          อนุมัติชำระ (manual)
        </button>
      </div>
    </article>
  );
}
