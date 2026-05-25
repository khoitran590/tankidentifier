import type { VehicleCategory } from "@/types/vehicle";

export type CategoryMeta = {
  id: VehicleCategory;
  label: string;
  singular: string;
  description: string;
  compareLabel: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "tanks",
    label: "Tanks",
    singular: "Tank",
    description: "Main battle tanks and armored fighting vehicles",
    compareLabel: "Compare tanks",
  },
  {
    id: "aircraft",
    label: "Aircraft",
    singular: "Aircraft",
    description: "Military fixed-wing aircraft and combat jets",
    compareLabel: "Compare aircraft",
  },
];

export function getCategoryMeta(id: VehicleCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function vehiclePath(category: VehicleCategory, slug: string): string {
  return `/${category}/${slug}`;
}

export function parseCompareId(id: string): { category: VehicleCategory; slug: string } | null {
  const [category, slug] = id.split(":");
  if ((category === "tanks" || category === "aircraft") && slug) {
    return { category, slug };
  }
  return null;
}

export function toCompareId(category: VehicleCategory, slug: string): string {
  return `${category}:${slug}`;
}
