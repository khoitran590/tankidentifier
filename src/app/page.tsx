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
    <PageShell
      title="Military tank catalog"
      description={`Browse ${tanks.length} tanks from the Kaggle dataset. View specifications, photo galleries, and compare up to four tanks side by side.`}
    >
      <Suspense fallback={<CatalogFallback />}>
        <TankCatalog tanks={tanks} />
      </Suspense>
    </PageShell>
  );
}
