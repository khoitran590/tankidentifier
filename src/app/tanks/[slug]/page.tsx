import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { SpecTable } from "@/components/SpecTable";
import { TankPager } from "@/components/TankPager";
import { getAdjacentTanks, getAllTanks, getTankBySlug } from "@/lib/tanks";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTanks().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tank = getTankBySlug(slug);
  if (!tank) return { title: "Tank not found" };
  return {
    title: `${tank.name} — Tank Identifier`,
    description: `${tank.specs.type} from ${tank.specs.country}. ${tank.specs.main_gun}.`,
  };
}

export default async function TankDetailPage({ params }: Props) {
  const { slug } = await params;
  const tank = getTankBySlug(slug);
  if (!tank) notFound();

  const { prev, next } = getAdjacentTanks(slug);
  const compareHref = `/compare?tanks=${encodeURIComponent(tank.slug)}`;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Catalog", href: "/" },
        { label: tank.name },
      ]}
      title={tank.name}
      description={`${tank.specs.type} · ${tank.specs.country} · ${tank.specs.era}`}
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
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-border-strong hover:bg-card-muted hover:text-foreground"
          >
            Catalog
          </Link>
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tank.images.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-xl border border-border bg-card-muted ${
                  i === 0 ? "sm:col-span-2 aspect-[16/10]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={src}
                  alt={`${tank.name} — photo ${i + 1}`}
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
            <SpecTable specs={tank.specs} />
          </div>
          <p className="text-xs text-subtle">
            Specifications are approximate open-source reference values for
            educational comparison, not official classified data.
          </p>
        </div>
      </div>

      <TankPager prev={prev} next={next} />
    </PageShell>
  );
}
