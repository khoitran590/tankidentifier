import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CatalogTankForm } from "@/components/CatalogTankForm";
import { RequireAdmin } from "@/components/RequireAdmin";

export const metadata = {
  title: "Add catalog tank — Tank Identifier",
  description: "Admin: add a tank to the public catalog.",
};

export default function AddCatalogTankPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Catalog", href: "/" },
        { label: "Add tank" },
      ]}
      title="Add tank to catalog"
      description="Publish a new tank to the public catalog. It appears on the home page, compare tool, and detail pages."
      actions={
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-card-muted hover:text-foreground"
        >
          ← Catalog
        </Link>
      }
    >
      <RequireAdmin>
        <CatalogTankForm mode="create" />
      </RequireAdmin>
    </PageShell>
  );
}
