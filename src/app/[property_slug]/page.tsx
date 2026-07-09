import type { Metadata } from "next";
import { PropertyErrorSkin } from "@/components/skins/minimal/PropertyErrorSkin";
import { PropertyProfileSkin } from "@/components/skins/minimal/PropertyProfileSkin";
import {
  getAvailableRooms,
  getPropertyBySlug,
} from "@/services/propertyService";

interface PropertyProfilePageProps {
  params: Promise<{ property_slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({
  params,
}: PropertyProfilePageProps): Promise<Metadata> {
  const { property_slug } = await params;

  try {
    const property = await getPropertyBySlug(property_slug);
    return {
      title: property
        ? `${property.name} | RentChill`
        : `${property_slug} | RentChill`,
    };
  } catch {
    return { title: `${property_slug} | RentChill` };
  }
}

export default async function PropertyProfilePage({
  params,
  searchParams,
}: PropertyProfilePageProps) {
  const { property_slug } = await params;
  const { from } = await searchParams;
  const fromOwner = from === "owner";

  let property = null;
  let rooms: Awaited<ReturnType<typeof getAvailableRooms>> = [];

  try {
    property = await getPropertyBySlug(property_slug);
    rooms = property ? await getAvailableRooms(property.id) : [];
  } catch {
    return (
      <PropertyErrorSkin
        titleKey="property.dbError"
        hintKey="property.dbErrorHint"
      />
    );
  }

  if (!property) {
    return (
      <PropertyErrorSkin
        titleKey="property.notFound"
        hintKey="property.notFoundHint"
      />
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const propertyUrl = baseUrl
    ? `${baseUrl}/${property.slug}`
    : `/${property.slug}`;

  return (
    <PropertyProfileSkin
      name={property.name}
      slug={property.slug}
      propertyUrl={propertyUrl}
      rooms={rooms}
      fromOwner={fromOwner}
    />
  );
}
