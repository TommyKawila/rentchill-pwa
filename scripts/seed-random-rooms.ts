import { readFileSync } from "fs";
import { resolve } from "path";
import { seedPropertyRooms } from "../src/services/devPropertySeedService";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

async function main() {
  loadEnvLocal();

  const propertySlug =
    process.argv[2] ?? process.env.SEED_PROPERTY_SLUG ?? "essence-chiangmai";
  const roomCount = Number(process.argv[3] ?? process.env.SEED_ROOM_COUNT ?? 20);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[seed-random-rooms] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const result = await seedPropertyRooms({
    property_slug: propertySlug,
    room_count: roomCount,
    mode: "replace",
    line_mode: "synthetic",
    status_mix: "random",
    with_meters: true,
  });

  console.log("[seed-random-rooms] OK", result);
}

main().catch((error) => {
  console.error("[seed-random-rooms]", error);
  process.exit(1);
});
