"use client";

import { useEffect, useMemo, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { listCatalogTanks } from "@/lib/catalog-tanks";
import { mergeCatalogTanks } from "@/lib/merge-tanks";
import {
  applyOverridesToTanks,
  listTankOverrides,
  type TankOverrideDoc,
} from "@/lib/tank-overrides";
import type { Tank } from "@/types/tank";

export function useMergedCatalogTanks(staticTanks: Tank[]) {
  const [catalogTanks, setCatalogTanks] = useState<Tank[]>([]);
  const [overrides, setOverrides] = useState<Map<string, TankOverrideDoc>>(
    () => new Map(),
  );
  const [loading, setLoading] = useState(isFirebaseConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.all([listCatalogTanks(), listTankOverrides()])
      .then(([catalog, overrideMap]) => {
        if (cancelled) return;
        setCatalogTanks(catalog);
        setOverrides(overrideMap);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load catalog.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tanks = useMemo(() => {
    const staticMerged = applyOverridesToTanks(staticTanks, overrides);
    return mergeCatalogTanks(staticMerged, catalogTanks);
  }, [staticTanks, catalogTanks, overrides]);

  return { tanks, catalogTanks, loading, error, catalogCount: catalogTanks.length };
}
