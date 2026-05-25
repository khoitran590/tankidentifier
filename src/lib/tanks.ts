import tanksData from "@/data/tanks.json";
import type { Tank, TanksData } from "@/types/tank";

const data = tanksData as TanksData;

export function getAllTanks(): Tank[] {
  return data.tanks;
}

export function getTankBySlug(slug: string): Tank | undefined {
  return data.tanks.find((t) => t.slug === slug);
}

export function getAdjacentTanks(slug: string): {
  prev?: Tank;
  next?: Tank;
} {
  const sorted = [...data.tanks].sort((a, b) => a.name.localeCompare(b.name));
  const index = sorted.findIndex((t) => t.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? sorted[index - 1] : undefined,
    next: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

export function getTanksBySlugs(slugs: string[]): Tank[] {
  const set = new Set(slugs);
  return data.tanks.filter((t) => set.has(t.slug));
}

export function searchTanks(query: string): Tank[] {
  const q = query.trim().toLowerCase();
  if (!q) return data.tanks;
  return data.tanks.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.slug.includes(q) ||
      t.specs.country.toLowerCase().includes(q) ||
      t.specs.type.toLowerCase().includes(q),
  );
}

export const COMPARE_METRICS = [
  { key: "country", label: "Country" },
  { key: "era", label: "Era" },
  { key: "type", label: "Type" },
  { key: "weight_t", label: "Weight (t)", format: (v: string | number) => `${v} t` },
  { key: "length_m", label: "Length (m)", format: (v: string | number) => `${v} m` },
  { key: "width_m", label: "Width (m)", format: (v: string | number) => `${v} m` },
  { key: "height_m", label: "Height (m)", format: (v: string | number) => `${v} m` },
  { key: "crew", label: "Crew" },
  { key: "main_gun", label: "Main armament" },
  { key: "engine", label: "Engine" },
  { key: "power_hp", label: "Power (hp)", format: (v: string | number) => `${v} hp` },
  {
    key: "power_to_weight_hp_t",
    label: "Power/weight",
    format: (v: string | number) => `${v} hp/t`,
  },
  { key: "max_speed_kmh", label: "Max speed", format: (v: string | number) => `${v} km/h` },
  { key: "range_km", label: "Range", format: (v: string | number) => `${v} km` },
  { key: "armor", label: "Armor" },
] as const;
