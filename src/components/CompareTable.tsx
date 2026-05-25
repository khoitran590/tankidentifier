import Image from "next/image";
import Link from "next/link";
import { COMPARE_METRICS } from "@/lib/tanks";
import type { Tank, TankSpecs } from "@/types/tank";

type Props = {
  tanks: Tank[];
};

function metricValue(tank: Tank, key: (typeof COMPARE_METRICS)[number]["key"]) {
  return tank.specs[key as keyof TankSpecs];
}

function numericMax(tanks: Tank[], key: keyof TankSpecs) {
  return Math.max(...tanks.map((t) => Number(t.specs[key]) || 0));
}

export function CompareTable({ tanks }: Props) {
  if (tanks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card-muted p-8 text-center text-muted">
        Select at least two tanks from the{" "}
        <Link href="/" className="font-medium text-accent hover:text-accent-hover">
          catalog
        </Link>{" "}
        to compare specifications side by side.
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
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card-muted">
            <th className="sticky left-0 z-10 min-w-[140px] bg-card-muted px-4 py-3 text-left text-muted">
              Metric
            </th>
            {tanks.map((tank) => (
              <th key={tank.slug} className="min-w-[200px] px-4 py-3 text-left">
                <Link href={`/tanks/${tank.slug}`} className="group block">
                  <div className="relative mb-2 aspect-video overflow-hidden rounded-lg border border-border bg-card">
                    <Image
                      src={tank.thumbnail}
                      alt={tank.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <span className="font-semibold text-heading group-hover:text-accent">
                    {tank.name}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE_METRICS.map((metric) => {
            const max =
              numericKeys.has(metric.key as keyof TankSpecs) &&
              metric.key !== "crew"
                ? numericMax(tanks, metric.key as keyof TankSpecs)
                : null;

            return (
              <tr key={metric.key} className="border-b border-border">
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
                    typeof raw === "number" &&
                    raw === max &&
                    tanks.length > 1;

                  return (
                    <td
                      key={tank.slug}
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
  );
}
