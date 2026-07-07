"use client";

import { useState } from "react";
import type { InvoiceOverrideRow } from "@/services/invoiceOverrideService";

interface OverrideSkinProps {
  invoice: InvoiceOverrideRow;
  disabled?: boolean;
  onSaveMeters: (waterUnit: number, electricUnit: number) => void;
  onApprove: (slipUrl?: string) => void;
}

export function OverrideSkin({
  invoice,
  disabled,
  onSaveMeters,
  onApprove,
}: OverrideSkinProps) {
  const [waterUnit, setWaterUnit] = useState(String(invoice.water_unit));
  const [electricUnit, setElectricUnit] = useState(String(invoice.electric_unit));
  const [slipUrl, setSlipUrl] = useState(invoice.slip_image_url ?? "");

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

      {slipUrl && (
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

      <div className="mt-4 grid grid-cols-2 gap-2">
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
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApprove(slipUrl || undefined)}
          className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          อนุมัติชำระ
        </button>
      </div>
    </article>
  );
}
