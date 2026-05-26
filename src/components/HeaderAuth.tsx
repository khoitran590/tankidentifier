"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function HeaderAuth() {
  const { user, loading, configured, signOut } = useAuth();

  if (!configured) {
    return null;
  }

  if (loading) {
    return (
      <span
        className="hidden h-10 w-20 animate-pulse rounded-lg bg-card-muted sm:block"
        aria-hidden
      />
    );
  }

  if (user) {
    const label = user.displayName || user.email?.split("@")[0] || "Account";
    return (
      <div className="flex items-center gap-2">
        <span
          className="hidden max-w-[140px] truncate text-sm text-muted lg:inline"
          title={user.email ?? undefined}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-card-muted"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover sm:px-4 dark:text-stone-950"
    >
      Log in
    </Link>
  );
}
