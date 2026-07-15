import type { InvoiceStatus } from "@/services/types";
import type { MaintenanceTicketRow } from "@/services/types";

export type TenantBoardTab = "bill" | "maintenance" | "contact" | "documents";

export const TENANT_BOARD_TABS: TenantBoardTab[] = [
  "bill",
  "maintenance",
  "contact",
  "documents",
];

export type TenantBillBadge = "pending" | "scanning" | null;

export type TenantNavBadges = {
  bill: TenantBillBadge;
  maintenance: number;
  documents: boolean;
};

export function tenantTabFromHash(hash: string): TenantBoardTab {
  const normalized = hash.replace(/^#/, "").trim();
  if (
    normalized === "maintenance" ||
    normalized === "contact" ||
    normalized === "documents"
  ) {
    return normalized;
  }
  return "bill";
}

export function tenantTabHash(tab: TenantBoardTab): string {
  return `#${tab}`;
}

export function computeTenantNavBadges(input: {
  invoiceStatus: InvoiceStatus | null | undefined;
  tickets: Pick<MaintenanceTicketRow, "status">[];
  canSign: boolean;
  hasLease: boolean;
  signed: boolean;
}): TenantNavBadges {
  let bill: TenantBillBadge = null;
  if (input.invoiceStatus === "pending") bill = "pending";
  else if (input.invoiceStatus === "scanning") bill = "scanning";

  const maintenance = input.tickets.filter(
    (ticket) => ticket.status === "waiting" || ticket.status === "in_progress",
  ).length;

  const documents =
    input.canSign && input.hasLease && !input.signed;

  return { bill, maintenance, documents };
}
