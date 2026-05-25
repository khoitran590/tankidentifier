import aircraftData from "@/data/aircraft.json";
import tanksData from "@/data/tanks.json";
import type { Vehicle, VehicleCategory, VehicleSpecs } from "@/types/vehicle";
import { toCompareId } from "@/lib/categories";

type RawEntry = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  thumbnail: string;
  specs: VehicleSpecs;
};

function withCategory(items: RawEntry[], category: VehicleCategory): Vehicle[] {
  return items.map((item) => ({ ...item, category }));
}

const tanks = withCategory(
  (tanksData as { tanks: RawEntry[] }).tanks ?? [],
  "tanks",
);
const aircraft = withCategory(
  (aircraftData as { aircraft: RawEntry[] }).aircraft ?? [],
  "aircraft",
);

const allVehicles = [...tanks, ...aircraft];

export function getAllVehicles(): Vehicle[] {
  return allVehicles;
}

export function getVehiclesByCategory(category: VehicleCategory): Vehicle[] {
  return allVehicles.filter((v) => v.category === category);
}

export function getVehicle(category: VehicleCategory, slug: string): Vehicle | undefined {
  return allVehicles.find((v) => v.category === category && v.slug === slug);
}

export function getVehiclesByCompareIds(ids: string[]): Vehicle[] {
  return ids
    .map((id) => {
      const [category, slug] = id.split(":") as [VehicleCategory, string];
      if (category !== "tanks" && category !== "aircraft") return undefined;
      return getVehicle(category, slug);
    })
    .filter((v): v is Vehicle => Boolean(v));
}

export function getAdjacentVehicles(
  category: VehicleCategory,
  slug: string,
): { prev?: Vehicle; next?: Vehicle } {
  const sorted = getVehiclesByCategory(category).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const index = sorted.findIndex((v) => v.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? sorted[index - 1] : undefined,
    next: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

export function searchVehicles(
  items: Vehicle[],
  query: string,
): Vehicle[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.slug.includes(q) ||
      v.specs.country.toLowerCase().includes(q) ||
      v.specs.type.toLowerCase().includes(q),
  );
}

export const COMPARE_METRICS = [
  { key: "country", label: "Country" },
  { key: "era", label: "Era" },
  { key: "type", label: "Type" },
  { key: "weight_t", label: "Weight (t)", format: (v: string | number) => `${v} t` },
  { key: "length_m", label: "Length (m)", format: (v: string | number) => `${v} m` },
  { key: "width_m", label: "Width / wingspan (m)", format: (v: string | number) => `${v} m` },
  { key: "height_m", label: "Height (m)", format: (v: string | number) => `${v} m` },
  { key: "crew", label: "Crew" },
  { key: "main_gun", label: "Armament" },
  { key: "engine", label: "Engine" },
  { key: "power_hp", label: "Power (hp)", format: (v: string | number) => `${v} hp` },
  {
    key: "power_to_weight_hp_t",
    label: "Power/weight",
    format: (v: string | number) => `${v} hp/t`,
  },
  { key: "max_speed_kmh", label: "Max speed", format: (v: string | number) => `${v} km/h` },
  { key: "range_km", label: "Range", format: (v: string | number) => `${v} km` },
  { key: "armor", label: "Protection / armor" },
] as const;

/** @deprecated */
export const getAllTanks = () => getVehiclesByCategory("tanks");
/** @deprecated */
export const getTankBySlug = (slug: string) => getVehicle("tanks", slug);
