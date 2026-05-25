import Image from "next/image";
import Link from "next/link";
import { vehiclePath } from "@/lib/categories";
import { COMPARE_METRICS } from "@/lib/vehicles";
import type { Vehicle, VehicleSpecs } from "@/types/vehicle";

type Props = {
  vehicles: Vehicle[];
  onRemove?: (vehicle: Vehicle) => void;
};

function metricValue(
  vehicle: Vehicle,
  key: (typeof COMPARE_METRICS)[number]["key"],
) {
  return vehicle.specs[key as keyof VehicleSpecs];
}

function numericMax(vehicles: Vehicle[], key: keyof VehicleSpecs) {
  return Math.max(...vehicles.map((v) => Number(v.specs[key]) || 0));
}

export function CompareTable({ vehicles, onRemove }: Props) {
  if (vehicles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card-muted p-8 text-center text-muted">
        Select at least two vehicles using the panel above, or from the{" "}
        <Link href="/" className="font-medium text-accent hover:text-accent-hover">
          catalog
        </Link>
        .
      </p>
    );
  }

  if (vehicles.length === 1) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card-muted p-8 text-center text-muted">
        Add one more vehicle to see a side-by-side comparison.
      </p>
    );
  }

  const numericKeys = new Set([
    "weight_t",
    "length_m",
    "width_m",
    "height_m",
    "crew",
    "power_hp",
    "power_to_weight_hp_t",
    "max_speed_kmh",
    "range_km",
  ]);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-heading">Comparison table</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card-muted">
              <th className="sticky left-0 z-10 min-w-[140px] bg-card-muted px-4 py-3 text-left text-muted">
                Metric
              </th>
              {vehicles.map((vehicle) => (
                <th
                  key={`${vehicle.category}:${vehicle.slug}`}
                  className="min-w-[200px] px-4 py-3 text-left align-top"
                >
                  <div className="space-y-2">
                    <Link
                      href={vehiclePath(vehicle.category, vehicle.slug)}
                      className="group block"
                    >
                      <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border border-border bg-card">
                        <Image
                          src={vehicle.thumbnail}
                          alt={vehicle.name}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                      <span className="font-semibold text-heading group-hover:text-accent">
                        {vehicle.name}
                      </span>
                      <span className="mt-0.5 block text-xs capitalize text-muted">
                        {vehicle.category}
                      </span>
                    </Link>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(vehicle)}
                        className="w-full rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-muted transition hover:border-accent/50 hover:bg-card hover:text-accent"
                      >
                        Remove from compare
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_METRICS.map((metric) => {
              const max =
                numericKeys.has(metric.key as keyof VehicleSpecs) &&
                metric.key !== "crew"
                  ? numericMax(vehicles, metric.key as keyof VehicleSpecs)
                  : null;

              return (
                <tr key={metric.key} className="border-b border-border">
                  <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-muted">
                    {metric.label}
                  </td>
                  {vehicles.map((vehicle) => {
                    const raw = metricValue(vehicle, metric.key);
                    const formatted =
                      "format" in metric && metric.format
                        ? metric.format(raw as string | number)
                        : String(raw);
                    const isBest =
                      max !== null &&
                      typeof raw === "number" &&
                      raw === max &&
                      vehicles.length > 1;

                    return (
                      <td
                        key={`${vehicle.category}:${vehicle.slug}`}
                        className={`px-4 py-3 ${isBest ? "bg-highlight font-medium text-accent" : "text-foreground"}`}
                      >
                        {formatted}
                        {isBest && (
                          <span className="ml-1 text-xs text-accent">▲</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
