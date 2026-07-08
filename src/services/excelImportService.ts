import { createAdminClient } from "@/services/supabase/admin";
import type { ImportRow } from "@/services/excel/parseWorkbook";
import { assertRoomCapacity } from "@/services/planTierService";

export type ImportResult = {
  property_slug: string;
  property_id: string;
  rooms_created: number;
};

export async function importPropertyRooms(
  rows: ImportRow[],
  ownerId: string,
): Promise<ImportResult[]> {
  const supabase = createAdminClient();
  const grouped = new Map<string, ImportRow[]>();

  for (const row of rows) {
    const list = grouped.get(row.property_slug) ?? [];
    list.push(row);
    grouped.set(row.property_slug, list);
  }

  const results: ImportResult[] = [];

  for (const [slug, propertyRows] of grouped) {
    const propertyName = propertyRows[0].property_name;

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .upsert({ name: propertyName, slug }, { onConflict: "slug" })
      .select("id, slug, owner_id")
      .single();

    if (propertyError || !property) {
      throw new Error(propertyError?.message ?? "สร้างหอพักไม่สำเร็จ");
    }

    if (property.owner_id && String(property.owner_id) !== ownerId) {
      throw new Error(`FORBIDDEN:${slug}`);
    }

    if (!property.owner_id) {
      const { error: ownerError } = await supabase
        .from("properties")
        .update({ owner_id: ownerId })
        .eq("id", property.id);
      if (ownerError) throw ownerError;
    }

    await assertRoomCapacity(
      property.id,
      slug,
      propertyRows.map((row) => row.room_number),
    );

    const roomPayload = propertyRows.map((row) => ({
      property_id: property.id,
      room_number: row.room_number,
      base_rent_price: row.base_rent_price,
      status: row.status,
    }));

    const { error: roomsError } = await supabase
      .from("rooms")
      .upsert(roomPayload, { onConflict: "property_id,room_number" });

    if (roomsError) {
      throw new Error(roomsError.message);
    }

    results.push({
      property_slug: property.slug,
      property_id: property.id,
      rooms_created: propertyRows.length,
    });
  }

  return results;
}
