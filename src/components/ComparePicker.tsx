"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CompareTable } from "@/components/CompareTable";
import type { Tank } from "@/types/tank";

type Props = {
  allTanks: Tank[];
};

const inputClass =
  "w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function ComparePicker({ allTanks }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.getAll("tanks");
  const [selected, setSelected] = useState<string[]>(initial);
  const [pickerQuery, setPickerQuery] = useState("");

  const selectedTanks = useMemo(
    () =>
      selected
        .map((slug) => allTanks.find((t) => t.slug === slug))
        .filter((t): t is Tank => Boolean(t)),
    [selected, allTanks],
  );

  const pickerOptions = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return allTanks
      .filter((t) => !selected.includes(t.slug))
      .filter(
        (t) =>
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.slug.includes(q),
      )
      .slice(0, 12);
  }, [allTanks, selected, pickerQuery]);

  function syncUrl(slugs: string[]) {
    if (slugs.length === 0) {
      router.replace("/compare");
      return;
    }
    const params = slugs.map((s) => `tanks=${encodeURIComponent(s)}`).join("&");
    router.replace(`/compare?${params}`);
  }

  function add(slug: string) {
    if (selected.includes(slug) || selected.length >= 4) return;
    const next = [...selected, slug];
    setSelected(next);
    syncUrl(next);
    setPickerQuery("");
  }

  function remove(slug: string) {
    const next = selected.filter((s) => s !== slug);
    setSelected(next);
    syncUrl(next);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Add tanks to compare</h2>
        <p className="mt-1 text-sm text-muted">
          Choose 2–4 vehicles. Higher numeric values are highlighted per row.{" "}
          <Link href="/" className="text-accent hover:text-accent-hover">
            Browse catalog
          </Link>
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedTanks.map((tank) => (
            <span
              key={tank.slug}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card-muted px-3 py-1.5 text-sm text-foreground"
            >
              <Link
                href={`/tanks/${tank.slug}`}
                className="hover:text-accent"
              >
                {tank.name}
              </Link>
              <button
                type="button"
                onClick={() => remove(tank.slug)}
                className="text-muted hover:text-accent"
                aria-label={`Remove ${tank.name}`}
              >
                ×
              </button>
            </span>
          ))}
          {selected.length === 0 && (
            <span className="text-sm text-muted">No tanks selected yet.</span>
          )}
        </div>

        {selected.length < 4 && (
          <div className="relative mt-4">
            <input
              type="search"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Search to add a tank…"
              className={inputClass}
            />
            {pickerQuery && pickerOptions.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg">
                {pickerOptions.map((tank) => (
                  <li key={tank.slug}>
                    <button
                      type="button"
                      onClick={() => add(tank.slug)}
                      className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-card-muted"
                    >
                      {tank.name}
                      <span className="ml-2 text-muted">{tank.specs.country}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <CompareTable tanks={selectedTanks} />
    </div>
  );
}
