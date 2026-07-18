import {
  getAvailableRooms,
  getPropertyBySlug,
} from "@/services/propertyService";
import { getPropertyPaymentBySlug } from "@/services/propertyPaymentService";
import { getPropertyMarketingBySlug } from "@/services/propertyMarketingService";
import type { PropertyContact, Room } from "@/services/types";

export type PropertyListing = {
  id: string;
  name: string;
  slug: string;
  marketing_description: string | null;
  marketing_address: string | null;
  gallery_urls: string[];
  contact: PropertyContact;
  include_utilities: boolean;
  water_rate_per_unit: number;
  electric_rate_per_unit: number;
  rooms: Room[];
  starting_rent: number | null;
};

export async function getPropertyListingBySlug(
  slug: string,
): Promise<PropertyListing | null> {
  const property = await getPropertyBySlug(slug);
  if (!property) return null;

  const [marketing, payment, rooms] = await Promise.all([
    getPropertyMarketingBySlug(slug),
    getPropertyPaymentBySlug(slug),
    getAvailableRooms(property.id),
  ]);

  const rents = rooms.map((room) => room.base_rent_price);
  const starting_rent = rents.length > 0 ? Math.min(...rents) : null;

  return {
    id: property.id,
    name: property.name,
    slug: property.slug,
    marketing_description: marketing?.marketing_description ?? null,
    marketing_address: marketing?.marketing_address ?? null,
    gallery_urls: marketing?.gallery_urls ?? [],
    contact: {
      property_name: property.name ?? null,
      billing_day: payment?.billing_day ?? 1,
      contact_line_url: payment?.contact_line_url ?? null,
      contact_line_qr_url: payment?.contact_line_qr_url ?? null,
      contact_phone: payment?.contact_phone ?? null,
      payment_prompt_pay: payment?.prompt_pay ?? null,
      payment_bank_account: payment?.bank_account ?? null,
      payment_receiver_name: payment?.receiver_name ?? null,
    },
    include_utilities: payment?.include_utilities ?? true,
    water_rate_per_unit: payment?.water_rate_per_unit ?? 10,
    electric_rate_per_unit: payment?.electric_rate_per_unit ?? 7,
    rooms,
    starting_rent,
  };
}
