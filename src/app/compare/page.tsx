import Link from "next/link";
import { Suspense } from "react";
import { ComparePicker } from "@/components/ComparePicker";
import { PageShell } from "@/components/PageShell";
import { getAllVehicles } from "@/lib/vehicles";

export const metadata = {
  title: "Compare vehicles — Tank Identifier",
  description:
    "Side-by-side comparison of military tank and aircraft specifications.",
};

function CompareFallback() {
  return <p className="text-muted">Loading compare tool…</p>;
}

export default function ComparePage() {
  const vehicles = getAllVehicles();

  return (
    <PageShell
      breadcrumbs={[
        { label: "Catalog", href: "/" },
        { label: "Compare" },
      ]}
      title="Compare vehicles"
      description="Select two to four tanks or aircraft and review key metrics in one table. Best-in-row values are highlighted for numeric fields."
      actions={
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-border-strong hover:bg-card-muted"
        >
          ← Back to catalog
        </Link>
      }
    >
      <Suspense fallback={<CompareFallback />}>
        <ComparePicker allVehicles={vehicles} />
      </Suspense>
    </PageShell>
  );
}
