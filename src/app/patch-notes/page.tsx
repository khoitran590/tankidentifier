import { PatchNotesPage } from "@/components/PatchNotesPage";
import { PageShell } from "@/components/PageShell";

export const metadata = {
  title: "Patch notes — Tank Identifier",
  description: "Catalog updates: new tanks and specification changes.",
};

export default function PatchNotesRoute() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Patch notes" },
      ]}
      title="Patch notes"
      description="Official updates to the tank catalog—new vehicles and revised specifications."
    >
      <PatchNotesPage />
    </PageShell>
  );
}
