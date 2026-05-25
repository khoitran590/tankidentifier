import tanksData from "@/data/tanks.json";
import type { Tank, TankSpecs } from "@/types/tank";

const tanks: Tank[] = (tanksData as { tanks: Tank[] }).tanks ?? [];

export function getAllTanks(): Tank[] {
  return tanks;
}

export function getTankBySlug(slug: string): Tank | undefined {
  return tanks.find((t) => t.slug === slug);
}

export function getTanksBySlugs(slugs: string[]): Tank[] {
  return slugs.map(getTankBySlug).filter((t): t is Tank => Boolean(t));
}

export function getAdjacentTanks(slug: string): { prev?: Tank; next?: Tank } {
  const sorted = [...tanks].sort((a, b) => a.name.localeCompare(b.name));
  const index = sorted.findIndex((t) => t.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? sorted[index - 1] : undefined,
    next: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

export function tankPath(slug: string): string {
  return `/tanks/${slug}`;
}

export const COMPARE_METRICS = [
  { key: "country", label: "Country" },
  { key: "era", label: "Era" },
  { key: "type", label: "Type" },
  { key: "weight_t", label: "Weight", format: (v: string | number) => `${v} t` },
  { key: "length_m", label: "Length", format: (v: string | number) => `${v} m` },
  { key: "width_m", label: "Width", format: (v: string | number) => `${v} m` },
  { key: "height_m", label: "Height", format: (v: string | number) => `${v} m` },
  { key: "crew", label: "Crew" },
  { key: "main_gun", label: "Main armament" },
  { key: "engine", label: "Engine" },
  { key: "power_hp", label: "Power", format: (v: string | number) => `${v} hp` },
  {
    key: "power_to_weight_hp_t",
    label: "Power/weight",
    format: (v: string | number) => `${v} hp/t`,
  },
  { key: "max_speed_kmh", label: "Max speed", format: (v: string | number) => `${v} km/h` },
  { key: "range_km", label: "Range", format: (v: string | number) => `${v} km` },
  { key: "armor", label: "Armor" },
] as const;

export type CompareMetricKey = (typeof COMPARE_METRICS)[number]["key"];

export function metricValue(tank: Tank, key: CompareMetricKey) {
  return tank.specs[key as keyof TankSpecs];
}
