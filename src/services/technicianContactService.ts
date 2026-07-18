import type { Locale } from "@/services/i18n/messages";
import { normalizeLineChatUrl } from "@/services/technicianLineService";
import type {
  MaintenanceTicketCategory,
  MaintenanceTicketRow,
  TechnicianContacts,
  TechnicianDept,
} from "@/services/types";

const CATEGORY_LABEL: Record<
  Locale,
  Record<MaintenanceTicketCategory, string>
> = {
  th: {
    ac: "แอร์เสีย",
    plumbing: "ท่อน้ำ/น้ำรั่ว",
    electrical: "ไฟ/ไฟฟ้า",
    furniture: "เฟอร์นิเจอร์",
    other: "อื่นๆ",
  },
  en: {
    ac: "Air conditioning",
    plumbing: "Plumbing / leak",
    electrical: "Electrical / power",
    furniture: "Furniture",
    other: "Other",
  },
};

const DEPT_LABEL: Record<Locale, Record<TechnicianDept, string>> = {
  th: {
    electrical: "ไฟฟ้า",
    plumbing: "ประปา",
    internet: "อินเตอร์เน็ต",
  },
  en: {
    electrical: "Electrical",
    plumbing: "Plumbing",
    internet: "Internet",
  },
};

export type ResolvedTechnicianContact = {
  phone: string | null;
  lineUrl: string | null;
  displayName: string | null;
  dept: TechnicianDept | null;
  deptLabel: string | null;
};

function resolveDept(category: MaintenanceTicketCategory): TechnicianDept | null {
  if (category === "electrical" || category === "ac") return "electrical";
  if (category === "plumbing") return "plumbing";
  return null;
}

function pickContact(
  contacts: TechnicianContacts,
  dept: TechnicianDept | null,
): TechnicianContacts[TechnicianDept] | undefined {
  if (!dept) return undefined;
  return contacts[dept];
}

export function resolveTechnicianContact(
  category: MaintenanceTicketCategory,
  contacts: TechnicianContacts,
  contactPhone: string | null,
  locale: Locale = "th",
): ResolvedTechnicianContact {
  const dept = resolveDept(category);
  const entry = pickContact(contacts, dept);
  const fallback = contactPhone?.trim() || null;

  return {
    phone: entry?.phone?.trim() || fallback,
    lineUrl: normalizeLineChatUrl(entry?.line_url) ?? null,
    displayName: entry?.display_name?.trim() || null,
    dept,
    deptLabel: dept ? DEPT_LABEL[locale][dept] : null,
  };
}

export function resolveTechnicianPhone(
  category: MaintenanceTicketCategory,
  contacts: TechnicianContacts,
  contactPhone: string | null,
): string | null {
  return resolveTechnicianContact(category, contacts, contactPhone).phone;
}

export function buildMaintenanceTicketShareUrl(
  ticketId: string,
  propertySlug?: string | null,
): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "";
  const params = new URLSearchParams();
  if (propertySlug) params.set("property", propertySlug);
  params.set("ticket", ticketId);
  return `${base}/maintenance?${params.toString()}`;
}

export function buildMaintenanceDispatchMessage(
  ticket: MaintenanceTicketRow,
  locale: Locale = "th",
  options?: { propertySlug?: string | null },
): string {
  const categoryLabel = CATEGORY_LABEL[locale][ticket.category];
  const shareUrl = buildMaintenanceTicketShareUrl(
    ticket.id,
    options?.propertySlug,
  );
  const lines =
    locale === "en"
      ? [
          `Maintenance — Room ${ticket.room_number} (${ticket.tenant_name})`,
          `Category: ${categoryLabel}`,
          `Details: ${ticket.description}`,
          `View ticket: ${shareUrl}`,
        ]
      : [
          `แจ้งซ่อม ห้อง ${ticket.room_number} (${ticket.tenant_name})`,
          `หมวด: ${categoryLabel}`,
          `รายละเอียด: ${ticket.description}`,
          `ดูรายการ: ${shareUrl}`,
        ];

  if (ticket.photo_url?.trim()) {
    lines.push(ticket.photo_url.trim());
  }
  if (ticket.video_url?.trim()) {
    lines.push(ticket.video_url.trim());
  }

  return lines.join("\n");
}

export function technicianButtonLabel(
  contact: ResolvedTechnicianContact,
  callPrefix: string,
): string {
  if (contact.displayName) return `${callPrefix} ${contact.displayName}`;
  if (contact.deptLabel) return `${callPrefix} ${contact.deptLabel}`;
  return callPrefix;
}
