/** Hostnames allowed for `next/image` optimization (also mirrored in `next.config.ts`). */
export const OPTIMIZED_IMAGE_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "hips.hearstapps.com",
]);

export function getRemoteImagePatterns() {
  return [...OPTIMIZED_IMAGE_HOSTS].map((hostname) => ({
    protocol: "https" as const,
    hostname,
    pathname: "/**",
  }));
}

export function shouldOptimizeImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  if (!src.startsWith("http")) return false;
  try {
    return OPTIMIZED_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}
