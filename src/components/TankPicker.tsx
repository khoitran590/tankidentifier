"use client";

import { useMemo, useState } from "react";
import type { Tank } from "@/types/tank";

type Props = {
  tanks: Tank[];
  value: string;
  onSelect: (tank: Tank) => void;
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function TankPicker({ tanks, value, onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => tanks.find((t) => t.slug === value),
    [tanks, value],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...tanks].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted.slice(0, 12);
    return sorted
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.includes(q) ||
          t.specs.country.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [tanks, query]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-heading">Select tank</label>
      <input
        type="search"
        className={`${inputClass} mt-1.5`}
        value={open ? query : selected?.name ?? query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search by name, slug, or country…"
        disabled={disabled}
      />
      {selected && !open && (
        <p className="mt-1 text-xs text-muted">
          {selected.specs.country} · {selected.specs.type}
          {selected.source === "catalog" ? " · Live catalog" : " · Dataset"}
        </p>
      )}
      {open && !disabled && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg">
          {suggestions.map((tank) => (
            <li key={tank.slug}>
              <button
                type="button"
                className="flex w-full flex-col px-4 py-2.5 text-left text-sm hover:bg-card-muted"
                onClick={() => {
                  onSelect(tank);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="font-medium text-foreground">{tank.name}</span>
                <span className="text-xs text-muted">
                  {tank.slug} · {tank.specs.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
