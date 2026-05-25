import { PageShell } from "@/components/PageShell";
import { TankCatalog } from "@/components/TankCatalog";
import { getAllTanks } from "@/lib/tanks";

export default function HomePage() {
  const tanks = getAllTanks();

  return (
    <PageShell
      title="Military tank catalog"
      description="Explore armored vehicles from the Kaggle image dataset. View specifications, photo galleries, and compare up to four tanks side by side."
    >
      <TankCatalog tanks={tanks} />
    </PageShell>
  );
}
