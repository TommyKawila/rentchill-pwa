import type { Metadata } from "next";
import {
  getAvailableRooms,
  getPropertyBySlug,
} from "@/services/propertyService";

interface PropertyProfilePageProps {
  params: Promise<{ property_slug: string }>;
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
}: PropertyProfilePageProps) {
  const { property_slug } = await params;

  let property = null;
  let rooms: Awaited<ReturnType<typeof getAvailableRooms>> = [];

  try {
    property = await getPropertyBySlug(property_slug);
    rooms = property ? await getAvailableRooms(property.id) : [];
  } catch {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">เชื่อมต่อฐานข้อมูลไม่สำเร็จ</h1>
          <p className="mt-2 text-sm text-zinc-600">
            รัน SQL ใน Supabase Dashboard จากไฟล์ migration ก่อน
          </p>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold">ไม่พบหอพัก</h1>
          <p className="mt-2 text-sm text-zinc-600">
            ลองเปิด /demo-apartment หลังรัน migration แล้ว
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-green-600">
            RentChill Property
          </p>
          <h1 className="mt-2 text-3xl font-bold">{property.name}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            ดูห้องว่าง ราคา และข้อมูลหอพักแบบโปร่งใส
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">ห้องว่าง</h2>
          {rooms.length === 0 ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6">
              <p className="text-sm text-zinc-600">ตอนนี้ไม่มีห้องว่าง</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium">ห้อง {room.room_number}</p>
                    <p className="text-sm text-zinc-600">
                      ฿{room.base_rent_price.toLocaleString("th-TH")} / เดือน
                    </p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Available
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-10 text-center">
          <p className="text-xs text-zinc-500">
            Powered by RentChill · โปร่งใส ตรวจสอบได้
          </p>
        </footer>
      </div>
    </main>
  );
}
