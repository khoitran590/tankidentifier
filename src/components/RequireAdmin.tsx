"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

type Props = {
  children: React.ReactNode;
};

export function RequireAdmin({ children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !adminLoading && !user) {
      router.replace("/login?next=/patch-notes");
    }
  }, [user, authLoading, adminLoading, router]);

  if (authLoading || adminLoading) {
    return <p className="text-muted">Checking access…</p>;
  }

  if (!user) {
    return (
      <p className="text-muted">
        <Link href="/login" className="text-accent">
          Log in
        </Link>{" "}
        to continue.
      </p>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-border bg-card-muted px-6 py-8 text-center text-sm">
        <p className="font-medium text-heading">Admin only</p>
        <p className="mt-2 text-muted">
          Your account is not marked as admin. Set{" "}
          <code className="text-foreground">isAdmin: true</code> on your user
          document in Firestore, or add your UID to{" "}
          <code className="text-foreground">NEXT_PUBLIC_ADMIN_UIDS</code> in{" "}
          <code className="text-foreground">.env.local</code>.
        </p>
        <Link href="/patch-notes" className="mt-4 inline-block text-accent">
          ← Back to patch notes
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
