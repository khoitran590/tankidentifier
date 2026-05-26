import { UserTankDetail } from "@/components/UserTankDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function UserTankDetailPage({ params }: Props) {
  const { id } = await params;
  return <UserTankDetail tankId={id} />;
}
