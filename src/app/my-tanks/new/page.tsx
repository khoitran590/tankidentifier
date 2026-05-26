import { PageShell } from "@/components/PageShell";
import { UserTankForm } from "@/components/UserTankForm";

export const metadata = {
  title: "Add tank — My tanks",
  description: "Add a custom tank with specifications to your collection.",
};

export default function NewUserTankPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "My tanks", href: "/my-tanks" },
        { label: "Add tank" },
      ]}
      title="Add a tank"
      description="Upload a photo and enter specifications like the main catalog. Data is saved to your Firestore profile."
    >
      <UserTankForm />
    </PageShell>
  );
}
