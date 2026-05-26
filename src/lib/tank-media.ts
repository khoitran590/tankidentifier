import type { Tank } from "@/types/tank";

export const DISPLAY_IMAGE_COUNT = 2;

/** Up to two images for card crossfade; second falls back to first when only one exists. */
export function getDisplayImages(tank: Tank): [string, string] {
  const primary = tank.thumbnail || tank.images[0];
  const secondary = tank.images[1] ?? primary;
  return [primary, secondary];
}

/** All unique image URLs for the detail gallery (thumbnail first). */
export function getGalleryImages(tank: Tank): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (url?: string) => {
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  };

  add(tank.thumbnail);
  for (const url of tank.images) add(url);
  return out;
}

export function imageCountLabel(count: number): string {
  return count === 1 ? "1 photo" : `${count} photos`;
}
