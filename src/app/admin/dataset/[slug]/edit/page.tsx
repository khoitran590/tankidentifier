"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { DatasetTankForm } from "@/components/DatasetTankForm";
import { PageShell } from "@/components/PageShell";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useMergedCatalogTanks } from "@/hooks/useMergedCatalogTanks";
import { getAllTanks, getTankBySlug, tankPath } from "@/lib/tanks";

export default function EditDatasetTankPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const staticTank = useMemo(() => getTankBySlug(slug), [slug]);
  const staticTanks = getAllTanks();
  const { tanks, loading } = useMergedCatalogTanks(staticTanks);
  const tank = tanks.find((t) => t.slug === slug) ?? staticTank;

  return (
    <PageShell
      breadcrumbs={[
        { label: "Catalog", href: "/" },
        { label: "Edit dataset tank" },
      ]}
      title="Edit dataset tank"
      description="Update specs or photos for a tank from the built-in dataset."
      actions={
        tank ? (
          <Link
            href={tankPath(slug)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-muted"
          >
            View public page
          </Link>
        ) : undefined
      }
    >
      <RequireAdmin>
        {loading && <p className="text-muted">Loading…</p>}
        {!loading && !tank && (
          <p className="text-muted">
            Tank not found.{" "}
            <Link href="/" className="text-accent">
              Back to catalog
            </Link>
          </p>
        )}
        {tank && tank.source === "catalog" && (
          <p className="text-muted">
            This tank is a live catalog entry.{" "}
            <Link href={`/admin/catalog/${tank.id}/edit`} className="text-accent">
              Edit catalog entry instead
            </Link>
          </p>
        )}
        {tank && tank.source !== "catalog" && <DatasetTankForm tank={tank} />}
      </RequireAdmin>
    </PageShell>
  );
}
