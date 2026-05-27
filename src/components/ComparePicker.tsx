"use client";

import { RemoteImage } from "@/components/RemoteImage";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CompareTable } from "@/components/CompareTable";
import { useMergedCatalogTanks } from "@/hooks/useMergedCatalogTanks";
import { getTanksBySlugsFromList } from "@/lib/merge-tanks";
import { getAllTanks, tankPath } from "@/lib/tanks";
import type { Tank } from "@/types/tank";

const MAX = 4;
const MIN = 2;

const inputClass =
  "w-full rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring";

function readSlugs(params: URLSearchParams): string[] {
  const direct = params.getAll("tanks");
  if (direct.length > 0) return direct.slice(0, MAX);
  return params
    .getAll("compare")
    .map((id) => (id.startsWith("tanks:") ? id.slice(6) : id))
    .filter(Boolean)
    .slice(0, MAX);
}

type SlotProps = {
  index: number;
  tank?: Tank;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

function CompareSlot({ index, tank, active, onSelect, onRemove }: SlotProps) {
  if (tank) {
    return (
      <div
        className={`relative flex flex-col overflow-hidden rounded-xl border bg-card transition ${
          active
            ? "border-accent ring-2 ring-accent/50 dark:shadow-[0_0_12px_rgba(251,191,36,0.1)]"
            : "border-border dark:border-border-strong"
        }`}
      >
        <div className="relative aspect-[4/3] bg-card-muted">
          <RemoteImage src={tank.thumbnail} alt={tank.name} fill className="object-cover" sizes="200px" />
          <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-xs font-medium text-accent">
            {index + 1}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <Link href={tankPath(tank.slug)} className="font-semibold text-heading hover:text-accent">
            {tank.name}
          </Link>
          <p className="text-xs text-muted">{tank.specs.country}</p>
          <button
            type="button"
            onClick={onRemove}
            className="mt-auto w-full rounded-lg border border-border py-2 text-xs font-medium text-muted transition hover:border-accent/50 hover:bg-card-muted hover:text-accent"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition ${
        active
          ? "border-accent bg-accent-muted text-accent ring-1 ring-inset ring-accent/35"
          : "border-border-strong bg-card-muted/50 text-muted hover:border-accent/50 hover:bg-card-muted hover:text-foreground dark:text-stone-300"
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-current text-xl">
        +
      </span>
      <span className="text-sm font-medium">Add tank {index + 1}</span>
    </button>
  );
}

export function ComparePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const staticTanks = getAllTanks();
  const { tanks: allTanks } = useMergedCatalogTanks(staticTanks);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const urlSlugs = useMemo(() => readSlugs(searchParams), [searchParams]);
  const [selected, setSelected] = useState<string[]>(urlSlugs);
  const [query, setQuery] = useState("");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    setSelected(urlSlugs);
  }, [urlSlugs.join("|")]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setListOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedTanks = useMemo(
    () => getTanksBySlugsFromList(allTanks, selected),
    [allTanks, selected],
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTanks
      .filter((t) => !selectedSet.has(t.slug))
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.slug.includes(q) ||
          t.specs.country.toLowerCase().includes(q) ||
          t.specs.type.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [allTanks, selectedSet, query]);

  const ready = selected.length >= MIN;
  const full = selected.length >= MAX;

  function syncUrl(slugs: string[]) {
    if (slugs.length === 0) {
      router.replace("/compare");
      return;
    }
    router.replace(`/compare?${slugs.map((s) => `tanks=${encodeURIComponent(s)}`).join("&")}`);
  }

  function addTank(tank: Tank) {
    if (selectedSet.has(tank.slug) || selected.length >= MAX) return;
    const next = [...selected, tank.slug];
    setSelected(next);
    syncUrl(next);
    setQuery("");
    setListOpen(false);
    setActiveSlot(null);
  }

  function removeSlug(slug: string) {
    const next = selected.filter((s) => s !== slug);
    setSelected(next);
    syncUrl(next);
  }

  function clearAll() {
    setSelected([]);
    syncUrl([]);
    setActiveSlot(0);
    setListOpen(true);
    searchRef.current?.focus();
  }

  function openSlot(index: number) {
    setActiveSlot(index);
    setListOpen(true);
    searchRef.current?.focus();
  }

  const slots: (Tank | undefined)[] = Array.from({ length: MAX }, (_, i) => selectedTanks[i]);

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-border bg-card-muted/40 p-4 dark:border-border-strong dark:bg-card/80 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Step 1 · Pick tanks
            </p>
            <h2 className="mt-1 text-lg font-semibold text-heading">
              Select {MIN}–{MAX} tanks to compare
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                ready
                  ? "bg-accent-muted text-accent"
                  : "bg-card text-muted"
              }`}
            >
              {selected.length} / {MAX} selected
            </span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-muted hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-muted">
          {ready
            ? "Scroll down to see the comparison table. Best values per row are highlighted."
            : selected.length === 1
              ? "Add one more tank to unlock the comparison table."
              : "Click an empty slot or search below to add tanks."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {slots.map((tank, i) => (
            <CompareSlot
              key={i}
              index={i}
              tank={tank}
              active={activeSlot === i}
              onSelect={() => openSlot(i)}
              onRemove={() => tank && removeSlug(tank.slug)}
            />
          ))}
        </div>

        <div ref={panelRef} className="relative mt-6">
          <label htmlFor="compare-search" className="text-sm font-medium text-heading">
            Search tanks to add
          </label>
          <input
            id="compare-search"
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setListOpen(true);
            }}
            onFocus={() => setListOpen(true)}
            disabled={full}
            placeholder={
              full
                ? "Maximum reached — remove a tank to add another"
                : "Type a tank name or country…"
            }
            className={`${inputClass} mt-2 disabled:cursor-not-allowed disabled:opacity-50`}
            aria-expanded={listOpen && !full}
            aria-controls="compare-suggestions"
          />

          {listOpen && !full && suggestions.length > 0 && (
            <ul
              id="compare-suggestions"
              className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-xl"
            >
              {suggestions.map((tank) => (
                <li key={tank.slug}>
                  <button
                    type="button"
                    onClick={() => addTank(tank)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-card-muted"
                  >
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card-muted">
                      <Image
                        src={tank.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{tank.name}</p>
                      <p className="text-xs text-muted">
                        {tank.specs.country} · {tank.specs.type}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-accent">Add</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {listOpen && !full && query && suggestions.length === 0 && (
            <p className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted shadow-xl">
              No tanks match &ldquo;{query}&rdquo;.{" "}
              <Link href="/" className="text-accent hover:text-accent-hover">
                Browse the catalog
              </Link>
            </p>
          )}

          {!full && !query && listOpen && (
            <p className="mt-2 text-xs text-muted">
              Tip: start typing, or{" "}
              <Link href="/" className="text-accent hover:text-accent-hover">
                pick tanks from the catalog
              </Link>{" "}
              and use Compare.
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent">
          Step 2 · Compare specs
        </p>
        <CompareTable tanks={selectedTanks} onRemove={(t) => removeSlug(t.slug)} />
      </div>
    </div>
  );
}
