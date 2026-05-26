"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CatalogTankForm } from "@/components/CatalogTankForm";
import { PageShell } from "@/components/PageShell";
import { RequireAdmin } from "@/components/RequireAdmin";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getCatalogTankById } from "@/lib/catalog-tanks";
import { tankPath } from "@/lib/tanks";
import type { Tank } from "@/types/tank";

export default function EditCatalogTankPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [tank, setTank] = useState<Tank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getCatalogTankById(id);
      setTank(data);
      if (!data) setError("Catalog tank not found.");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageShell
      breadcrumbs={[
        { label: "Catalog", href: "/" },
        { label: "Manage catalog", href: "/admin/catalog" },
        { label: "Edit" },
      ]}
      title="Edit catalog tank"
      description="Update specifications or add and remove photos."
      actions={
        tank ? (
          <Link
            href={tankPath(tank.slug)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-card-muted"
          >
            View public page
          </Link>
        ) : undefined
      }
    >
      <RequireAdmin>
        {loading && <p className="text-muted">Loading…</p>}
        {error && (
          <p className="text-muted">
            {error}{" "}
            <Link href="/admin/catalog" className="text-accent">
              Back to manage catalog
            </Link>
          </p>
        )}
        {tank && <CatalogTankForm mode="edit" initial={tank} />}
      </RequireAdmin>
    </PageShell>
  );
}
