import type { ReactNode } from "react";

interface OwnerDashboardShellProps {
  propertySlug: string;
  pendingCount: number;
  paidCount: number;
  children: ReactNode;
}

const navItems = [
  { href: "/import", label: "นำเข้า Excel", externalProperty: false },
  { href: "/settings", label: "บัญชีรับเงิน", externalProperty: true },
  { href: "/admin/line", label: "เมนู LINE", externalProperty: false },
] as const;

export function OwnerDashboardShell({
  propertySlug,
  pendingCount,
  paidCount,
  children,
}: OwnerDashboardShellProps) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            RentChill
          </p>
          <h1 className="mt-2 text-2xl font-bold">แดชบอร์ดเจ้าของหอ</h1>
          <p className="mt-2 text-sm text-zinc-600">หอ: {propertySlug}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-800">รอตรวจ</p>
              <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs text-green-800">ชำระแล้ว</p>
              <p className="text-2xl font-bold text-green-900">{paidCount}</p>
            </div>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const href = item.externalProperty
                ? `${item.href}?property=${encodeURIComponent(propertySlug)}`
                : item.href;
              return (
                <a
                  key={item.href}
                  href={href}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href={`/${propertySlug}`}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700"
            >
              หน้าหอ
            </a>
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
