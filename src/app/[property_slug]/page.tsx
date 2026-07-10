import type { Metadata } from "next";
import { PropertyErrorSkin } from "@/components/skins/minimal/PropertyErrorSkin";
import { PropertyProfileSkin } from "@/components/skins/minimal/PropertyProfileSkin";
import { getPropertyListingBySlug } from "@/services/propertyListingService";

interface PropertyProfilePageProps {
  params: Promise<{ property_slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata({
  params,
}: PropertyProfilePageProps): Promise<Metadata> {
  const { property_slug } = await params;

  try {
    const listing = await getPropertyListingBySlug(property_slug);
    if (!listing) {
      return { title: `${property_slug} | RentChill` };
    }

    const description =
      listing.marketing_description?.trim() ||
      "ดูห้องว่าง ราคา และข้อมูลหอพัก";

    return {
      title: `${listing.name} | RentChill`,
      description,
      openGraph: {
        title: listing.name,
        description,
        ...(listing.gallery_urls[0]
          ? { images: [{ url: listing.gallery_urls[0] }] }
          : {}),
      },
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

  let listing = null;

  try {
    listing = await getPropertyListingBySlug(property_slug);
  } catch {
    return (
      <PropertyErrorSkin
        titleKey="property.dbError"
        hintKey="property.dbErrorHint"
      />
    );
  }

  if (!listing) {
    return (
      <PropertyErrorSkin
        titleKey="property.notFound"
        hintKey="property.notFoundHint"
      />
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const propertyUrl = baseUrl
    ? `${baseUrl}/${listing.slug}`
    : `/${listing.slug}`;

  return (
    <PropertyProfileSkin
      name={listing.name}
      slug={listing.slug}
      propertyUrl={propertyUrl}
      rooms={listing.rooms}
      galleryUrls={listing.gallery_urls}
      marketingDescription={listing.marketing_description}
      marketingAddress={listing.marketing_address}
      startingRent={listing.starting_rent}
      contact={listing.contact}
      includeUtilities={listing.include_utilities}
      waterRatePerUnit={listing.water_rate_per_unit}
      electricRatePerUnit={listing.electric_rate_per_unit}
      fromOwner={fromOwner}
    />
  );
}
