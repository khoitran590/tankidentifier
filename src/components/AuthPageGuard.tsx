"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
};

export function AuthPageGuard({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <p className="text-center text-muted">Loading…</p>;
  }

  if (user) {
    return (
      <div className="rounded-xl border border-border bg-card-muted px-6 py-8 text-center text-sm">
        <p className="text-muted">You are already signed in.</p>
        <Link href="/" className="mt-3 inline-block font-medium text-accent hover:text-accent-hover">
          Go to catalog →
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
