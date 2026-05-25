import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { VehicleCatalog } from "@/components/VehicleCatalog";
import { getAllVehicles, getVehiclesByCategory } from "@/lib/vehicles";

function CatalogFallback() {
  return <p className="text-muted">Loading catalog…</p>;
}

export default function HomePage() {
  const vehicles = getAllVehicles();
  const tankCount = getVehiclesByCategory("tanks").length;
  const aircraftCount = getVehiclesByCategory("aircraft").length;

  return (
    <PageShell
      title="Military vehicle catalog"
      description={`Browse ${tankCount} tanks and ${aircraftCount} aircraft from Kaggle datasets. View specifications, galleries, and compare up to four vehicles side by side.`}
    >
      <Suspense fallback={<CatalogFallback />}>
        <VehicleCatalog vehicles={vehicles} />
      </Suspense>
    </PageShell>
  );
}
