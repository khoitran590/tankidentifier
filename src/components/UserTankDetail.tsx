"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SpecTable } from "@/components/SpecTable";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { deleteUserTank, getUserTank } from "@/lib/user-tanks";
import type { UserTank } from "@/types/user-tank";

type Props = {
  tankId: string;
};

export function UserTankDetail({ tankId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [tank, setTank] = useState<UserTank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserTank(user.uid, tankId);
      setTank(data);
      if (!data) setError("Tank not found.");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user, tankId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete() {
    if (!user || !tank) return;
    if (!confirm(`Delete "${tank.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteUserTank(user.uid, tank.id);
      router.push("/my-tanks");
      router.refresh();
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-muted">Loading tank…</p>;
  }

  if (error || !tank) {
    return (
      <div className="space-y-4">
        <p className="text-muted">{error ?? "Tank not found."}</p>
        <Link href="/my-tanks" className="text-accent hover:text-accent-hover">
          ← Back to My tanks
        </Link>
      </div>
    );
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "My tanks", href: "/my-tanks" },
        { label: tank.name },
      ]}
      title={tank.name}
      description={`${tank.specs.type} · ${tank.specs.country} · ${tank.specs.era}`}
      actions={
        <>
          <Link
            href="/my-tanks"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card-muted"
          >
            ← My tanks
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-red-500/50 hover:text-red-500 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card-muted">
          <Image
            src={tank.thumbnail}
            alt={tank.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            Your custom entry
          </p>
          <SpecTable specs={tank.specs} />
          <p className="text-xs text-subtle">
            Stored in your Firestore account. Only you can edit or delete this entry.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
