import Link from "next/link";
import { CatalogAdminList } from "@/components/CatalogAdminList";
import { PageShell } from "@/components/PageShell";
import { RequireAdmin } from "@/components/RequireAdmin";

export const metadata = {
  title: "Manage catalog — Tank Identifier",
  description: "Admin: edit tanks in the public catalog.",
};

export default function ManageCatalogPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Catalog", href: "/" },
        { label: "Manage catalog" },
      ]}
      title="Manage catalog tanks"
      description="Edit or remove admin-added catalog tanks."
      actions={
        <Link
          href="/admin/catalog/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
        >
          + Add tank
        </Link>
      }
    >
      <RequireAdmin>
        <CatalogAdminList />
      </RequireAdmin>
    </PageShell>
  );
}
