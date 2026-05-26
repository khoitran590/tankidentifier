/** UIDs listed in NEXT_PUBLIC_ADMIN_UIDS (comma-separated) can manage patch notes. */
export function getAdminUids(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_UIDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminUid(uid: string | undefined): boolean {
  if (!uid) return false;
  return getAdminUids().includes(uid);
}
