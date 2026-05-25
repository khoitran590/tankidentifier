"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CompareTable } from "@/components/CompareTable";
import { getCategoryMeta, parseCompareId, toCompareId, vehiclePath } from "@/lib/categories";
import type { Vehicle, VehicleCategory } from "@/types/vehicle";

type Props = {
  allVehicles: Vehicle[];
};

const MAX_COMPARE = 4;
const inputClass =
  "w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

function readCompareIds(searchParams: URLSearchParams): string[] {
  const modern = searchParams.getAll("compare");
  if (modern.length > 0) return modern;

  const legacy = searchParams.getAll("tanks");
  return legacy.map((slug) => `tanks:${slug}`);
}

export function ComparePicker({ allVehicles }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addPanelRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(
    () => ({
      tanks: allVehicles.filter((v) => v.category === "tanks").length,
      aircraft: allVehicles.filter((v) => v.category === "aircraft").length,
    }),
    [allVehicles],
  );

  const urlIds = useMemo(() => readCompareIds(searchParams), [searchParams]);

  const initialCategory =
    parseCompareId(urlIds[0] ?? "")?.category ??
    (searchParams.get("category") === "aircraft" ? "aircraft" : "tanks");

  const categoryParam = searchParams.get("category");
  const category: VehicleCategory =
    categoryParam === "aircraft" || categoryParam === "tanks"
      ? categoryParam
      : initialCategory;

  const [selected, setSelected] = useState<string[]>(urlIds);
  const [pickerQuery, setPickerQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setSelected(urlIds);
  }, [urlIds.join("|")]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (addPanelRef.current && !addPanelRef.current.contains(e.target as Node)) {
        setAddOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const meta = getCategoryMeta(category);
  const inCategory = useMemo(
    () => allVehicles.filter((v) => v.category === category),
    [allVehicles, category],
  );

  const selectedVehicles = useMemo(
    () =>
      selected
        .map((id) => {
          const parsed = parseCompareId(id);
          if (!parsed) return undefined;
          return allVehicles.find(
            (v) => v.category === parsed.category && v.slug === parsed.slug,
          );
        })
        .filter((v): v is Vehicle => Boolean(v)),
    [selected, allVehicles],
  );

  const selectedIds = useMemo(() => new Set(selected), [selected]);

  const pickerOptions = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return inCategory
      .filter((v) => !selectedIds.has(toCompareId(v.category, v.slug)))
      .filter(
        (v) =>
          !q ||
          v.name.toLowerCase().includes(q) ||
          v.slug.includes(q) ||
          v.specs.country.toLowerCase().includes(q),
      )
      .slice(0, q ? 16 : 10);
  }, [inCategory, selectedIds, pickerQuery, category]);

  function syncUrl(ids: string[]) {
    if (ids.length === 0) {
      router.replace(`/compare?category=${category}`);
      return;
    }
    const params = ids
      .map((id) => `compare=${encodeURIComponent(id)}`)
      .join("&");
    router.replace(`/compare?${params}&category=${category}`);
  }

  function add(vehicle: Vehicle) {
    const id = toCompareId(vehicle.category, vehicle.slug);
    if (selectedIds.has(id) || selected.length >= MAX_COMPARE) return;
    const next = [...selected, id];
    setSelected(next);
    syncUrl(next);
    setPickerQuery("");
    setAddOpen(false);
  }

  function remove(id: string) {
    const next = selected.filter((s) => s !== id);
    setSelected(next);
    syncUrl(next);
  }

  function clearAll() {
    setSelected([]);
    syncUrl([]);
  }

  const canAddMore = selected.length < MAX_COMPARE && counts[category] > 0;

  return (
    <div className="space-y-8">
      <CategoryTabs counts={counts} active={category} mode="compare" />

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-heading">Your comparison</h2>
            <p className="mt-1 text-sm text-muted">
              Add or remove up to {MAX_COMPARE} vehicles. Use the table below to
              compare specs side by side.
            </p>
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-border-strong hover:bg-card-muted hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-2" aria-label="Selected vehicles">
          {selectedVehicles.length === 0 && (
            <li className="rounded-lg border border-dashed border-border bg-card-muted px-4 py-6 text-center text-sm text-muted">
              No vehicles selected. Search below to add {meta.label.toLowerCase()}.
            </li>
          )}
          {selectedVehicles.map((vehicle) => {
            const id = toCompareId(vehicle.category, vehicle.slug);
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card-muted px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={vehiclePath(vehicle.category, vehicle.slug)}
                    className="font-medium text-heading hover:text-accent"
                  >
                    {vehicle.name}
                  </Link>
                  <p className="text-xs text-muted capitalize">
                    {vehicle.category} · {vehicle.specs.country}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/50 hover:bg-card hover:text-accent"
                >
                  Remove
                </button>
              </li>
            );
          })}
          {canAddMore &&
            Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
              <li
                key={`slot-${i}`}
                className="rounded-lg border border-dashed border-border px-4 py-3 text-center text-sm text-muted"
              >
                Empty slot — add a {meta.singular.toLowerCase()} below
              </li>
            ))}
        </ul>

        {category === "aircraft" && counts.aircraft === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-border bg-card-muted px-4 py-3 text-sm text-muted">
            Run <code className="text-foreground">npm run prepare-data:aircraft</code> to
            populate aircraft from Kaggle.
          </p>
        )}

        {canAddMore && (
          <div ref={addPanelRef} className="relative mt-6">
            <label className="text-sm font-medium text-heading">
              Add {meta.singular.toLowerCase()}
            </label>
            <input
              type="search"
              value={pickerQuery}
              onChange={(e) => {
                setPickerQuery(e.target.value);
                setAddOpen(true);
              }}
              onFocus={() => setAddOpen(true)}
              placeholder={`Search ${meta.label.toLowerCase()} by name or country…`}
              className={`${inputClass} mt-2`}
              aria-expanded={addOpen}
              aria-controls="compare-add-list"
            />
            {addOpen && pickerOptions.length > 0 && (
              <ul
                id="compare-add-list"
                className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg"
              >
                {pickerOptions.map((vehicle) => (
                  <li key={vehicle.slug}>
                    <button
                      type="button"
                      onClick={() => add(vehicle)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-card-muted"
                    >
                      <span className="font-medium">{vehicle.name}</span>
                      <span className="text-xs text-muted">{vehicle.specs.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {addOpen && pickerQuery && pickerOptions.length === 0 && (
              <p className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted shadow-lg">
                No matches. Try another name or{" "}
                <Link
                  href={`/?category=${category}`}
                  className="text-accent hover:text-accent-hover"
                >
                  browse the catalog
                </Link>
                .
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              <Link href={`/?category=${category}`} className="text-accent hover:text-accent-hover">
                Browse catalog
              </Link>{" "}
              — or pick from suggestions when the search box is focused.
            </p>
          </div>
        )}

        {selected.length >= MAX_COMPARE && (
          <p className="mt-4 text-sm text-muted">
            Maximum of {MAX_COMPARE} vehicles. Remove one to add another.
          </p>
        )}
      </section>

      <CompareTable
        vehicles={selectedVehicles}
        onRemove={(vehicle) => remove(toCompareId(vehicle.category, vehicle.slug))}
      />
    </div>
  );
}
