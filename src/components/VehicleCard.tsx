import Image from "next/image";
import Link from "next/link";
import { vehiclePath } from "@/lib/categories";
import type { Vehicle } from "@/types/vehicle";

type Props = {
  vehicle: Vehicle;
  onAddCompare?: (id: string) => void;
  compareSelected?: boolean;
};

export function VehicleCard({ vehicle, onAddCompare, compareSelected }: Props) {
  const href = vehiclePath(vehicle.category, vehicle.slug);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md transition hover:border-accent/40 hover:shadow-[var(--shadow)]">
      <Link
        href={href}
        className="relative aspect-[4/3] overflow-hidden bg-card-muted"
      >
        <Image
          src={vehicle.thumbnail}
          alt={vehicle.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute left-2 top-2 rounded bg-background/85 px-2 py-0.5 text-xs font-medium text-accent backdrop-blur-sm">
          {vehicle.specs.country}
        </span>
        <span className="absolute right-2 top-2 rounded bg-background/85 px-2 py-0.5 text-xs text-muted backdrop-blur-sm capitalize">
          {vehicle.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={href}>
            <h2 className="font-semibold text-heading group-hover:text-accent">
              {vehicle.name}
            </h2>
          </Link>
          <p className="mt-1 text-xs text-muted">
            {vehicle.specs.type} · {vehicle.specs.era}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-subtle">Weight</dt>
            <dd className="font-medium text-foreground">{vehicle.specs.weight_t} t</dd>
          </div>
          <div>
            <dt className="text-subtle">Max speed</dt>
            <dd className="font-medium text-foreground">
              {vehicle.specs.max_speed_kmh} km/h
            </dd>
          </div>
        </dl>
        <div className="mt-auto flex gap-2 pt-1">
          <Link
            href={href}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-foreground transition hover:border-border-strong hover:bg-card-muted"
          >
            Details
          </Link>
          {onAddCompare && (
            <button
              type="button"
              onClick={() => onAddCompare(`${vehicle.category}:${vehicle.slug}`)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                compareSelected
                  ? "bg-accent text-white dark:text-stone-950"
                  : "bg-card-muted text-accent hover:bg-accent-muted"
              }`}
            >
              {compareSelected ? "Selected" : "Compare"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
