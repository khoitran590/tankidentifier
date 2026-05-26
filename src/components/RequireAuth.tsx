"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: Props) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/login?next=/my-tanks");
    }
  }, [user, loading, configured, router]);

  if (!configured) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card-muted p-6 text-sm text-muted">
        Firebase is not configured. Add keys to <code>.env.local</code> to use My tanks.
      </p>
    );
  }

  if (loading) {
    return <p className="text-muted">Checking sign-in…</p>;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card-muted px-6 py-10 text-center">
        <p className="text-muted">Sign in to manage your tanks.</p>
        <Link
          href="/login?next=/my-tanks"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
        >
          Log in
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
