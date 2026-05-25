import Image from "next/image";
import Link from "next/link";
import {
  COMPARE_METRICS,
  metricValue,
  tankPath,
  type CompareMetricKey,
} from "@/lib/tanks";
import type { Tank } from "@/types/tank";

type Props = {
  tanks: Tank[];
  onRemove?: (tank: Tank) => void;
};

function numericMax(tanks: Tank[], key: CompareMetricKey) {
  const values = tanks
    .map((t) => metricValue(t, key))
    .filter((v): v is number => typeof v === "number");
  return values.length ? Math.max(...values) : 0;
}

export function CompareTable({ tanks, onRemove }: Props) {
  if (tanks.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card-muted px-6 py-16 text-center">
        <p className="text-lg font-medium text-heading">Comparison table locked</p>
        <p className="mt-2 text-sm text-muted">
          Add at least two tanks above to see specifications side by side.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
        >
          Browse catalog →
        </Link>
      </div>
    );
  }

  const numericKeys = new Set<CompareMetricKey>([
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
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card-muted">
            <th className="sticky left-0 z-10 min-w-[130px] bg-card-muted px-4 py-4 text-left font-medium text-muted">
              Specification
            </th>
            {tanks.map((tank) => (
              <th
                key={tank.slug}
                className="min-w-[180px] max-w-[220px] px-4 py-4 text-left align-top"
              >
                <Link href={tankPath(tank.slug)} className="group block">
                  <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border border-border">
                    <Image
                      src={tank.thumbnail}
                      alt={tank.name}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="180px"
                    />
                  </div>
                  <span className="font-semibold text-heading group-hover:text-accent">
                    {tank.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">{tank.specs.country}</span>
                </Link>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(tank)}
                    className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted transition hover:border-accent/50 hover:text-accent"
                  >
                    Remove
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE_METRICS.map((metric) => {
            const max =
              numericKeys.has(metric.key) && metric.key !== "crew"
                ? numericMax(tanks, metric.key)
                : null;

            return (
              <tr key={metric.key} className="border-b border-border last:border-0">
                <td className="sticky left-0 z-10 bg-background px-4 py-3 font-medium text-muted">
                  {metric.label}
                </td>
                {tanks.map((tank) => {
                  const raw = metricValue(tank, metric.key);
                  const formatted =
                    "format" in metric && metric.format
                      ? metric.format(raw as string | number)
                      : String(raw);
                  const isBest =
                    max !== null &&
                    max > 0 &&
                    typeof raw === "number" &&
                    raw === max &&
                    tanks.length > 1;

                  return (
                    <td
                      key={tank.slug}
                      className={`px-4 py-3 ${isBest ? "bg-highlight font-semibold text-accent" : "text-foreground"}`}
                    >
                      {formatted}
                      {isBest && <span className="ml-1.5 text-xs">best</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border bg-card-muted px-4 py-2 text-xs text-muted">
        Highlighted cells show the highest value in each numeric row (not including crew).
      </p>
    </div>
  );
}
