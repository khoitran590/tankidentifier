"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { CatalogScrollEnhancements } from "@/components/CatalogScrollEnhancements";
import { TankCard } from "@/components/TankCard";
import type { Tank } from "@/types/tank";

type Props = {
  tanks: Tank[];
};

const searchClass =
  "w-full rounded-xl border border-border bg-input py-3 pl-10 pr-4 text-foreground shadow-sm placeholder:text-subtle transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/40";

const fieldClass =
  "w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/40";

export function TankCatalog({ tanks }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [classification, setClassification] = useState("all");
  const [compare, setCompare] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const filterPanelId = useId();
  const filterWrapRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(query);
  const deferredCountry = useDeferredValue(country);
  const deferredClassification = useDeferredValue(classification);
  const isStale =
    isPending ||
    deferredQuery !== query ||
    deferredCountry !== country ||
    deferredClassification !== classification;

  const countries = useMemo(() => {
    const set = new Set(tanks.map((t) => t.specs.country));
    return ["all", ...Array.from(set).sort()];
  }, [tanks]);

  const classifications = useMemo(() => {
    const set = new Set(tanks.map((t) => t.specs.type));
    return ["all", ...Array.from(set).sort()];
  }, [tanks]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return tanks.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.slug.includes(q) ||
        t.specs.type.toLowerCase().includes(q);
      const matchesCountry =
        deferredCountry === "all" || t.specs.country === deferredCountry;
      const matchesClassification =
        deferredClassification === "all" ||
        t.specs.type === deferredClassification;
      return matchesQuery && matchesCountry && matchesClassification;
    });
  }, [tanks, deferredQuery, deferredCountry, deferredClassification]);

  const panelFiltersActive = country !== "all" || classification !== "all";

  useEffect(() => {
    if (!filtersOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFiltersOpen(false);
    }

    function onPointerDown(e: MouseEvent) {
      if (
        filterWrapRef.current &&
        !filterWrapRef.current.contains(e.target as Node)
      ) {
        setFiltersOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [filtersOpen]);

  function onQueryChange(value: string) {
    setQuery(value);
    startTransition(() => {});
  }

  function onCountryChange(value: string) {
    setCountry(value);
    startTransition(() => {});
  }

  function onClassificationChange(value: string) {
    setClassification(value);
    startTransition(() => {});
  }

  function resetFilters() {
    onQueryChange("");
    onCountryChange("all");
    onClassificationChange("all");
    setFiltersOpen(false);
  }

  function resetPanelFilters() {
    onCountryChange("all");
    onClassificationChange("all");
  }

  function toggleCompare(slug: string) {
    setCompare((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  }

  function goCompare() {
    if (compare.length < 2) return;
    const params = compare.map((s) => `tanks=${encodeURIComponent(s)}`).join("&");
    router.push(`/compare?${params}`);
  }

  return (
    <div className="catalog-page space-y-6 sm:space-y-8">
      <CatalogScrollEnhancements />

      <div
        className="catalog-toolbar sticky z-30 -mx-4 space-y-3 border-b border-border/70 bg-background/90 px-4 py-3 shadow-[0_8px_24px_-12px_var(--shadow)] backdrop-blur-xl dark:border-border-strong sm:-mx-6 sm:px-6"
        style={{ top: "calc(3.25rem + env(safe-area-inset-top, 0px))" }}
      >
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search tanks</span>
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by name, type, or country..."
              className={searchClass}
              aria-busy={isStale}
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-xs font-medium text-muted hover:bg-card-muted hover:text-foreground"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </label>

          <div ref={filterWrapRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`flex h-full min-h-[46px] items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition ${
                filtersOpen || panelFiltersActive
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border bg-card text-muted hover:border-border-strong hover:bg-card-muted hover:text-foreground"
              }`}
              aria-expanded={filtersOpen}
              aria-controls={filterPanelId}
            >
              <FilterIcon />
              <span className="hidden sm:inline">Filter</span>
              {panelFiltersActive && (
                <span className="flex h-2 w-2 rounded-full bg-accent" aria-hidden />
              )}
            </button>

            {filtersOpen && (
              <div
                id={filterPanelId}
                role="dialog"
                aria-label="Catalog filters"
                className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-lg shadow-[var(--shadow)] dark:border-border-strong"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-heading">Filters</span>
                  {panelFiltersActive && (
                    <button
                      type="button"
                      onClick={resetPanelFilters}
                      className="text-xs font-medium text-accent hover:text-accent-hover"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-muted">Country</span>
                    <select
                      value={country}
                      onChange={(e) => onCountryChange(e.target.value)}
                      className={fieldClass}
                      aria-busy={isStale}
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "All countries" : c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-muted">Classification</span>
                    <select
                      value={classification}
                      onChange={(e) => onClassificationChange(e.target.value)}
                      className={fieldClass}
                      aria-busy={isStale}
                    >
                      {classifications.map((t) => (
                        <option key={t} value={t}>
                          {t === "all" ? "All classifications" : t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p
            className={`tabular-nums text-muted transition-opacity ${isStale ? "opacity-60" : ""}`}
            aria-live="polite"
          >
            <span className="font-medium text-foreground">{filtered.length}</span>
            {" "}
            of {tanks.length} tanks
            {isStale && <span className="text-subtle"> · updating</span>}
          </p>
          <Link
            href="/compare"
            className="font-medium text-accent hover:text-accent-hover"
            prefetch={false}
          >
            Compare tool →
          </Link>
        </div>

        {compare.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/35 bg-accent-muted/80 px-3 py-2.5">
            <span className="text-sm font-medium text-accent-foreground">
              {compare.length} selected for compare
            </span>
            <button
              type="button"
              onClick={() => setCompare([])}
              className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={compare.length < 2}
              onClick={goCompare}
              className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 dark:text-stone-950"
            >
              Compare now
            </button>
          </div>
        )}
      </div>

      <div
        id="catalog-results"
        className={`catalog-grid scroll-mt-40 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 transition-opacity duration-200 ${
          isStale ? "opacity-75" : "opacity-100"
        }`}
      >
        {filtered.map((tank, index) => (
          <TankCard
            key={tank.slug}
            tank={tank}
            onAddCompare={toggleCompare}
            compareSelected={compare.includes(tank.slug)}
            priority={index < 6}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card-muted/50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-heading">No tanks match</p>
          <p className="mt-2 text-sm text-muted">
            Try another search or adjust the filter options.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover dark:text-stone-950"
          >
            Reset filters
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="pb-4 text-center text-xs text-subtle">
          End of catalog · {filtered.length} tanks shown
        </p>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M4 6h16M7 12h10M10 18h4"
        strokeLinecap="round"
      />
    </svg>
  );
}
