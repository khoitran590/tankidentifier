"use client";

import { RemoteImage } from "@/components/RemoteImage";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  catalogTankEditPath,
  deleteCatalogTank,
  listCatalogTanks,
} from "@/lib/catalog-tanks";
import { tankPath } from "@/lib/tanks";
import type { Tank } from "@/types/tank";

export function CatalogAdminList() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTanks(await listCatalogTanks());
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(tank: Tank) {
    if (
      !confirm(
        `Remove "${tank.name}" from the public catalog? This cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(tank.id);
    setError(null);
    try {
      await deleteCatalogTank(tank.id);
      setTanks((prev) => prev.filter((t) => t.id !== tank.id));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-muted">Loading catalog entries…</p>;
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  if (tanks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <p className="font-medium text-heading">No admin-added tanks yet</p>
        <Link
          href="/admin/catalog/new"
          className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
        >
          Add catalog tank
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {tanks.map((tank) => (
        <li
          key={tank.id}
          className="flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap"
        >
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-card-muted">
            {tank.thumbnail ? (
              <RemoteImage
                src={tank.thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-heading">{tank.name}</p>
            <p className="text-xs text-muted">
              {tank.specs.country} · {tank.images.length} photo
              {tank.images.length === 1 ? "" : "s"}
            </p>
            <Link
              href={tankPath(tank.slug)}
              className="text-xs text-accent hover:text-accent-hover"
            >
              {tankPath(tank.slug)}
            </Link>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <Link
              href={catalogTankEditPath(tank.id)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
            >
              Edit
            </Link>
            <Link
              href={tankPath(tank.slug)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-muted"
            >
              View
            </Link>
            <button
              type="button"
              disabled={deletingId === tank.id}
              onClick={() => handleDelete(tank)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-red-500/50 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
            >
              {deletingId === tank.id ? "Removing…" : "Remove"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
