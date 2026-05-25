import type { Tank } from "@/types/tank";

export const DISPLAY_IMAGE_COUNT = 2;

/** Up to two images for UI; duplicates thumbnail when only one exists. */
export function getDisplayImages(tank: Tank): [string, string] {
  const primary = tank.thumbnail || tank.images[0];
  const secondary = tank.images[1] ?? primary;
  return [primary, secondary];
}

export function imageCountLabel(count: number): string {
  return count === 1 ? "1 photo" : `${count} photos`;
}
