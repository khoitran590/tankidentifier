"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TankCard } from "@/components/TankCard";
import type { Tank } from "@/types/tank";

type Props = {
  tanks: Tank[];
};

const inputClass =
  "rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function TankCatalog({ tanks }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [compare, setCompare] = useState<string[]>([]);

  const countries = useMemo(() => {
    const set = new Set(tanks.map((t) => t.specs.country));
    return ["all", ...Array.from(set).sort()];
  }, [tanks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tanks.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.slug.includes(q) ||
        t.specs.type.toLowerCase().includes(q);
      const matchesCountry =
        country === "all" || t.specs.country === country;
      return matchesQuery && matchesCountry;
    });
  }, [tanks, query, country]);

  function toggleCompare(slug: string) {
    setCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  }

  function goCompare() {
    if (compare.length < 2) return;
    router.push(`/compare?${compare.map((s) => `tanks=${s}`).join("&")}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-muted">Search</span>
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
          Showing {filtered.length} of {tanks.length} vehicles
        </p>
        <Link
          href="/compare"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Open compare tool →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tank) => (
          <TankCard
            key={tank.slug}
            tank={tank}
            onAddCompare={toggleCompare}
            compareSelected={compare.includes(tank.slug)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted">No tanks match your filters.</p>
      )}
    </div>
  );
}
