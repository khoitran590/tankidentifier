import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { SpecTable } from "@/components/SpecTable";
import { VehiclePager } from "@/components/VehiclePager";
import { getCategoryMeta, toCompareId, vehiclePath } from "@/lib/categories";
import {
  getAdjacentVehicles,
  getAllVehicles,
  getVehicle,
  getVehiclesByCategory,
} from "@/lib/vehicles";
import type { VehicleCategory } from "@/types/vehicle";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

function isCategory(value: string): value is VehicleCategory {
  return value === "tanks" || value === "aircraft";
}

export function generateStaticParams() {
  return getAllVehicles().map((v) => ({
    category: v.category,
    slug: v.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category, slug } = await params;
  if (!isCategory(category)) return { title: "Not found" };
  const vehicle = getVehicle(category, slug);
  if (!vehicle) return { title: "Not found" };
  const meta = getCategoryMeta(category);
  return {
    title: `${vehicle.name} — ${meta.singular} Identifier`,
    description: `${vehicle.specs.type} from ${vehicle.specs.country}.`,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { category: cat, slug } = await params;
  if (!isCategory(cat)) notFound();

  const vehicle = getVehicle(cat, slug);
  if (!vehicle) notFound();

  const meta = getCategoryMeta(cat);
  const { prev, next } = getAdjacentVehicles(cat, slug);
  const compareHref = `/compare?compare=${encodeURIComponent(toCompareId(cat, slug))}`;
  const catalogCount = getVehiclesByCategory(cat).length;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: meta.label, href: `/?category=${cat}` },
        { label: vehicle.name },
      ]}
      title={vehicle.name}
      description={`${vehicle.specs.type} · ${vehicle.specs.country} · ${vehicle.specs.era}`}
      actions={
        <>
          <Link
            href={compareHref}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover dark:text-stone-950"
          >
            Add to compare
          </Link>
          <Link
            href="/compare"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-card-muted"
          >
            Compare tool
          </Link>
          <Link
            href={`/?category=${cat}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-border-strong hover:bg-card-muted hover:text-foreground"
          >
            All {meta.label.toLowerCase()} ({catalogCount})
          </Link>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {vehicle.images.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-xl border border-border bg-card-muted ${
                  i === 0 ? "sm:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={src}
                  alt={`${vehicle.name} — photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-heading">
              Specifications
            </h2>
            <SpecTable specs={vehicle.specs} category={vehicle.category} />
          </div>
          <p className="text-xs text-subtle">
            Specifications are approximate reference values for educational
            comparison, not official classified data.
          </p>
        </div>
      </div>

      <VehiclePager category={cat} prev={prev} next={next} />
    </PageShell>
  );
}
