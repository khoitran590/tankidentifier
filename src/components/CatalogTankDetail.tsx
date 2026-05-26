"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SpecTable } from "@/components/SpecTable";
import { TankGallery } from "@/components/TankMedia";
import { TankPager } from "@/components/TankPager";
import { useMergedCatalogTanks } from "@/hooks/useMergedCatalogTanks";
import { catalogTankEditPath, getCatalogTankBySlug } from "@/lib/catalog-tanks";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getAdjacentTanksFromList } from "@/lib/merge-tanks";
import { getAllTanks, tankPath } from "@/lib/tanks";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import type { Tank } from "@/types/tank";

type Props = {
  slug: string;
};

export function CatalogTankDetail({ slug }: Props) {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const staticTanks = getAllTanks();
  const { tanks: mergedTanks, loading: mergeLoading } = useMergedCatalogTanks(staticTanks);
  const [tank, setTank] = useState<Tank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMissing(false);

    void getCatalogTankBySlug(slug)
      .then((found) => {
        if (cancelled) return;
        if (!found) setMissing(true);
        else setTank(found);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getAuthErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading || mergeLoading) {
    return (
      <PageShell title="Loading…" description="">
        <p className="text-muted">Loading tank…</p>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Error" description="">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link href="/" className="mt-4 inline-block text-accent hover:text-accent-hover">
          ← Back to catalog
        </Link>
      </PageShell>
    );
  }

  if (missing || !tank) notFound();

  const { prev, next } = getAdjacentTanksFromList(mergedTanks, slug);
  const compareHref = `/compare?tanks=${encodeURIComponent(slug)}`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Tanks", href: "/" },
        { label: tank.name },
      ]}
      title={tank.name}
      description={`${tank.specs.type} · ${tank.specs.country} · ${tank.specs.era}`}
      actions={
        <>
          <Link
            href={compareHref}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover dark:text-stone-950"
          >
            Add to compare
          </Link>
          <Link
            href="/compare"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-card-muted"
          >
            Compare tool
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-border-strong hover:bg-card-muted hover:text-foreground"
          >
            All tanks ({mergedTanks.length})
          </Link>
          {isAdmin && !adminLoading && tank && (
            <Link
              href={catalogTankEditPath(tank.id)}
              className="rounded-lg border border-accent/50 bg-accent-muted px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent-muted/80"
            >
              Edit catalog entry
            </Link>
          )}
        </>
      }
    >
      <p className="mb-6 text-xs font-medium uppercase tracking-wide text-accent">
        Live catalog entry
      </p>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <TankGallery tank={tank} />

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-heading">Specifications</h2>
            <SpecTable specs={tank.specs} />
          </div>
          <p className="text-xs text-subtle">
            Specifications are approximate reference values for educational comparison,
            not official classified data.
          </p>
        </div>
      </div>

      <TankPager prev={prev} next={next} />
    </PageShell>
  );
}
