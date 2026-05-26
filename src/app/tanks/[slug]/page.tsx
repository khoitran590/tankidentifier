import { CatalogTankDetail } from "@/components/CatalogTankDetail";
import { StaticTankDetail } from "@/components/StaticTankDetail";
import { getAllTanks, getTankBySlug } from "@/lib/tanks";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTanks().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tank = getTankBySlug(slug);
  if (!tank) {
    return {
      title: "Tank — Tank Identifier",
      description: "Military tank specifications and photos.",
    };
  }
  return {
    title: `${tank.name} — Tank Identifier`,
    description: `${tank.specs.type} from ${tank.specs.country}.`,
  };
}

export default async function TankDetailPage({ params }: Props) {
  const { slug } = await params;
  const tank = getTankBySlug(slug);
  if (tank) return <StaticTankDetail tank={tank} slug={slug} />;
  return <CatalogTankDetail slug={slug} />;
}
