"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { SpecTable } from "@/components/SpecTable";
import { TankGallery } from "@/components/TankMedia";
import { TankPager } from "@/components/TankPager";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useMergedCatalogTanks } from "@/hooks/useMergedCatalogTanks";
import { getAdjacentTanksFromList } from "@/lib/merge-tanks";
import { getAllTanks, tankPath } from "@/lib/tanks";
import type { Tank } from "@/types/tank";

type Props = {
  tank: Tank;
  slug: string;
};

export function StaticTankDetail({ tank: initialTank, slug }: Props) {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const staticTanks = getAllTanks();
  const { tanks: mergedTanks, loading } = useMergedCatalogTanks(staticTanks);
  const tank = mergedTanks.find((t) => t.slug === slug) ?? initialTank;
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
            All tanks ({loading ? "…" : mergedTanks.length})
          </Link>
          {isAdmin && !adminLoading && (
            <Link
              href={`/admin/dataset/${slug}/edit`}
              className="rounded-lg border border-accent/50 bg-accent-muted px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent-muted/80"
            >
              Edit dataset tank
            </Link>
          )}
        </>
      }
    >
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
