"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { deleteUserTank, listUserTanks, userTankPath } from "@/lib/user-tanks";
import type { UserTank } from "@/types/user-tank";

export function MyTanksList() {
  const { user } = useAuth();
  const [tanks, setTanks] = useState<UserTank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setTanks(await listUserTanks(user.uid));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(tank: UserTank) {
    if (!user) return;
    if (!confirm(`Delete "${tank.name}"? This cannot be undone.`)) return;

    setDeletingId(tank.id);
    try {
      await deleteUserTank(user.uid, tank.id);
      setTanks((prev) => prev.filter((t) => t.id !== tank.id));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-muted">Loading your tanks…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  if (tanks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card-muted px-6 py-12 text-center">
        <p className="text-muted">You haven&apos;t added any tanks yet.</p>
        <Link
          href="/my-tanks/new"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
        >
          Add your first tank
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tanks.map((tank) => (
        <article
          key={tank.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md"
        >
          <Link
            href={userTankPath(tank.id)}
            className="relative aspect-[4/3] bg-card-muted"
          >
            <Image
              src={tank.thumbnail}
              alt={tank.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-xs font-medium text-accent">
              Your tank
            </span>
          </Link>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div>
              <Link href={userTankPath(tank.id)}>
                <h2 className="font-semibold text-heading hover:text-accent">
                  {tank.name}
                </h2>
              </Link>
              <p className="mt-1 text-xs text-muted">
                {tank.specs.type} · {tank.specs.country}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-subtle">Weight</dt>
                <dd className="font-medium">{tank.specs.weight_t} t</dd>
              </div>
              <div>
                <dt className="text-subtle">Max speed</dt>
                <dd className="font-medium">{tank.specs.max_speed_kmh} km/h</dd>
              </div>
            </dl>
            <div className="mt-auto flex gap-2 pt-1">
              <Link
                href={userTankPath(tank.id)}
                className="flex-1 rounded-lg border border-border py-2 text-center text-xs font-medium hover:bg-card-muted"
              >
                View
              </Link>
              <button
                type="button"
                disabled={deletingId === tank.id}
                onClick={() => handleDelete(tank)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-red-500/50 hover:text-red-500 disabled:opacity-50"
              >
                {deletingId === tank.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
