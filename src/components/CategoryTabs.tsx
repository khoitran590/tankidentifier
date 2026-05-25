"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import type { VehicleCategory } from "@/types/vehicle";

type Props = {
  counts: Record<VehicleCategory, number>;
  active?: VehicleCategory;
  /** When set, tabs link to compare page instead of catalog */
  mode?: "catalog" | "compare";
};

function tabHref(cat: VehicleCategory, mode: "catalog" | "compare") {
  return mode === "compare" ? `/compare?category=${cat}` : `/?category=${cat}`;
}

export function CategoryTabs({ counts, active, mode = "catalog" }: Props) {
  const pathname = usePathname();
  const current =
    active ??
    (pathname.startsWith("/aircraft")
      ? "aircraft"
      : pathname.startsWith("/tanks")
        ? "tanks"
        : pathname.startsWith("/compare")
          ? "tanks"
          : "tanks");

  return (
    <div
      className="flex flex-wrap gap-2 rounded-xl border border-border bg-card-muted/50 p-1"
      role="tablist"
      aria-label="Vehicle categories"
    >
      {CATEGORIES.map((cat) => {
        const isActive = current === cat.id;
        const count = counts[cat.id];
        return (
          <Link
            key={cat.id}
            href={tabHref(cat.id, mode)}
            role="tab"
            aria-selected={isActive}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-accent text-white shadow-sm dark:text-stone-950"
                : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            {cat.label}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                isActive ? "bg-black/20" : "bg-border"
              }`}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
