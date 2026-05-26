"use client";

import { TankCatalog } from "@/components/TankCatalog";
import { useMergedCatalogTanks } from "@/hooks/useMergedCatalogTanks";
import type { Tank } from "@/types/tank";

type Props = {
  staticTanks: Tank[];
};

export function MergedTankCatalog({ staticTanks }: Props) {
  const { tanks, loading, error, catalogCount } = useMergedCatalogTanks(staticTanks);

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          Could not load admin-added tanks: {error}
        </p>
      )}
      {!loading && catalogCount > 0 && (
        <p className="text-xs text-subtle">
          Includes {catalogCount} tank{catalogCount === 1 ? "" : "s"} added to the live catalog.
        </p>
      )}
      <TankCatalog tanks={tanks} />
    </div>
  );
}
