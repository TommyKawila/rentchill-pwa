import type { Invoice } from "@/services/types";

interface InvoiceSkinProps {
  invoice: Invoice;
  tenantName: string;
  roomNumber: string;
  onPay: () => void;
}

const formatAmount = (amount: number) =>
  amount.toLocaleString("th-TH", { minimumFractionDigits: 0 });

export function InvoiceSkin({
  invoice,
  tenantName,
  roomNumber,
  onPay,
}: InvoiceSkinProps) {
  return (
    <article className="bg-zinc-50 p-6 text-zinc-900">
      <header className="border-b border-zinc-200 pb-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Invoice</p>
        <h1 className="mt-1 text-lg font-semibold">{tenantName}</h1>
        <p className="text-sm text-zinc-600">
          Room {roomNumber} · {invoice.billing_month}
        </p>
      </header>

      <section className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600">Base Rent</span>
          <span className="font-medium">
            ฿{formatAmount(invoice.base_rent_amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Water ({invoice.water_unit} units)</span>
          <span className="font-medium">
            ฿{formatAmount(invoice.water_amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">
            Electric ({invoice.electric_unit} units)
          </span>
          <span className="font-medium">
            ฿{formatAmount(invoice.electric_amount)}
          </span>
        </div>
      </section>

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <div className="flex justify-between text-base font-bold">
          <span>Total Amount</span>
          <span>฿{formatAmount(invoice.total_amount)}</span>
        </div>
      </div>

      <footer className="mt-6 flex flex-col items-center gap-4">
        <div
          aria-hidden
          className="flex h-28 w-28 items-center justify-center border border-dashed border-zinc-300 bg-white text-xs text-zinc-400"
        >
          QR Code
        </div>
        <button
          type="button"
          onClick={onPay}
          className="w-full rounded-md bg-zinc-900 py-3 text-sm font-medium text-white"
        >
          Pay Now
        </button>
      </footer>
    </article>
  );
}
