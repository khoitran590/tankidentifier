import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { TankCatalog } from "@/components/TankCatalog";
import { getAllTanks } from "@/lib/tanks";

function CatalogFallback() {
  return <p className="text-muted">Loading catalog…</p>;
}

export default function HomePage() {
  const tanks = getAllTanks();

  return (
    <div className="catalog-page-wrap">
      <PageShell
        title="Military tank catalog"
        description={`Browse ${tanks.length} tanks with photos and specs. Search above; use Filter for country and classification.`}
        className="pb-6 sm:pb-8"
      >
        <Suspense fallback={<CatalogFallback />}>
          <TankCatalog tanks={tanks} />
        </Suspense>
      </PageShell>
    </div>
  );
}
