import type { Tank } from "@/types/tank";

/** Static JSON tanks first, then Firestore catalog additions (no duplicate slugs). */
export function mergeCatalogTanks(staticTanks: Tank[], catalogTanks: Tank[]): Tank[] {
  const staticSlugs = new Set(staticTanks.map((t) => t.slug));
  const extra = catalogTanks.filter((t) => !staticSlugs.has(t.slug));
  return [...staticTanks, ...extra];
}

export function getTankBySlugFromList(
  tanks: Tank[],
  slug: string,
): Tank | undefined {
  return tanks.find((t) => t.slug === slug);
}

export function getTanksBySlugsFromList(tanks: Tank[], slugs: string[]): Tank[] {
  const bySlug = new Map(tanks.map((t) => [t.slug, t]));
  return slugs.map((s) => bySlug.get(s)).filter((t): t is Tank => Boolean(t));
}

export function getAdjacentTanksFromList(
  tanks: Tank[],
  slug: string,
): { prev?: Tank; next?: Tank } {
  const sorted = [...tanks].sort((a, b) => a.name.localeCompare(b.name));
  const index = sorted.findIndex((t) => t.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? sorted[index - 1] : undefined,
    next: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}
