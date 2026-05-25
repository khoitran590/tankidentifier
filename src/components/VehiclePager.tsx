import Link from "next/link";
import { vehiclePath } from "@/lib/categories";
import type { Vehicle, VehicleCategory } from "@/types/vehicle";

type Props = {
  category: VehicleCategory;
  prev?: Vehicle;
  next?: Vehicle;
};

export function VehiclePager({ category, prev, next }: Props) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Vehicle navigation"
      className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={vehiclePath(category, prev.slug)}
          className="group rounded-xl border border-border bg-card p-4 transition hover:border-accent/40 hover:bg-card-muted"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-subtle">
            ← Previous
          </span>
          <p className="mt-1 font-semibold text-heading group-hover:text-accent">
            {prev.name}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={vehiclePath(category, next.slug)}
          className="group rounded-xl border border-border bg-card p-4 text-right transition hover:border-accent/40 hover:bg-card-muted sm:col-start-2"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-subtle">
            Next →
          </span>
          <p className="mt-1 font-semibold text-heading group-hover:text-accent">
            {next.name}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
