"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryTabs } from "@/components/CategoryTabs";
import { VehicleCard } from "@/components/VehicleCard";
import { getCategoryMeta, toCompareId } from "@/lib/categories";
import type { Vehicle, VehicleCategory } from "@/types/vehicle";

type Props = {
  vehicles: Vehicle[];
  initialCategory?: VehicleCategory;
};

const inputClass =
  "rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function VehicleCatalog({ vehicles, initialCategory = "tanks" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as VehicleCategory | null;
  const category =
    categoryParam === "aircraft" || categoryParam === "tanks"
      ? categoryParam
      : initialCategory;

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [compare, setCompare] = useState<string[]>([]);

  const counts = useMemo(
    () => ({
      tanks: vehicles.filter((v) => v.category === "tanks").length,
      aircraft: vehicles.filter((v) => v.category === "aircraft").length,
    }),
    [vehicles],
  );

  const inCategory = useMemo(
    () => vehicles.filter((v) => v.category === category),
    [vehicles, category],
  );

  const countries = useMemo(() => {
    const set = new Set(inCategory.map((v) => v.specs.country));
    return ["all", ...Array.from(set).sort()];
  }, [inCategory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inCategory.filter((v) => {
      const matchesQuery =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.slug.includes(q) ||
        v.specs.type.toLowerCase().includes(q);
      const matchesCountry =
        country === "all" || v.specs.country === country;
      return matchesQuery && matchesCountry;
    });
  }, [inCategory, query, country]);

  const meta = getCategoryMeta(category);

  function toggleCompare(id: string) {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function goCompare() {
    if (compare.length < 2) return;
    const params = compare.map((id) => `compare=${encodeURIComponent(id)}`).join("&");
    router.push(`/compare?${params}`);
  }

  return (
    <div className="space-y-8">
      <CategoryTabs counts={counts} active={category} />

      {counts[category] === 0 && category === "aircraft" && (
        <p className="rounded-xl border border-dashed border-border bg-card-muted p-6 text-sm text-muted">
          No aircraft in the catalog yet. Run{" "}
          <code className="text-foreground">npm run prepare-data:aircraft</code>{" "}
          after the Kaggle dataset finishes downloading (~6GB).
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-muted">Search {meta.label.toLowerCase()}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, country, type…"
              className={inputClass}
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-sm sm:w-48">
            <span className="text-muted">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputClass}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All countries" : c}
                </option>
              ))}
            </select>
          </label>
        </div>
        {compare.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent-muted px-4 py-2">
            <span className="text-sm text-accent-foreground">
              {compare.length} selected (max 4)
            </span>
            <button
              type="button"
              onClick={() => setCompare([])}
              className="text-xs text-muted hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={compare.length < 2}
              onClick={goCompare}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:text-stone-950"
            >
              Compare now
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted">
          Showing {filtered.length} of {inCategory.length} {meta.label.toLowerCase()}
        </p>
        <Link
          href="/compare"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Open compare tool →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((vehicle) => {
          const compareId = toCompareId(vehicle.category, vehicle.slug);
          return (
            <VehicleCard
              key={compareId}
              vehicle={vehicle}
              onAddCompare={toggleCompare}
              compareSelected={compare.includes(compareId)}
            />
          );
        })}
      </div>

      {filtered.length === 0 && counts[category] > 0 && (
        <p className="text-center text-muted">No matches for your filters.</p>
      )}
    </div>
  );
}
