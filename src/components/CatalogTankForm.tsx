"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CatalogTankPhotosEditor } from "@/components/CatalogTankPhotosEditor";
import { TankSpecsFields } from "@/components/TankSpecsFields";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  createCatalogTank,
  updateCatalogTank,
  type CatalogTankPhotosInput,
} from "@/lib/catalog-tanks";
import { tankPath } from "@/lib/tanks";
import type { Tank } from "@/types/tank";
import { EMPTY_TANK_SPECS } from "@/types/user-tank";

type Props = {
  mode: "create" | "edit";
  initial?: Tank;
};

export function CatalogTankForm({ mode, initial }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(initial?.name ?? "");
  const [specs, setSpecs] = useState(initial?.specs ?? EMPTY_TANK_SPECS);
  const [photos, setPhotos] = useState<CatalogTankPhotosInput>({
    keepUrls: initial?.images ?? [],
    uploadFiles: [],
    pasteUrls: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPhotosChange = useCallback((input: CatalogTankPhotosInput) => {
    setPhotos(input);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "create") {
        const { slug } = await createCatalogTank(
          { name, specs, photos },
          user?.uid,
        );
        router.push(tankPath(slug));
      } else if (initial) {
        const { slug } = await updateCatalogTank(initial.id, { name, specs, photos });
        router.push(tankPath(slug));
      }
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error && !("code" in (err as object))
          ? err.message
          : getAuthErrorMessage(err),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Tank details</h2>
        <p className="mt-1 text-sm text-muted">
          {isEdit
            ? "Update the public catalog entry. The URL slug stays the same."
            : "This tank is added to the public catalog for all visitors."}
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-heading">Name</span>
          <input
            className="mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. T-90M"
            required
          />
        </label>
        {isEdit && initial && (
          <p className="mt-2 text-xs text-subtle">
            Public page:{" "}
            <a href={tankPath(initial.slug)} className="text-accent hover:underline">
              {tankPath(initial.slug)}
            </a>
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Photos</h2>
        <div className="mt-4">
          <CatalogTankPhotosEditor
            initialUrls={initial?.images}
            onChange={onPhotosChange}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Specifications</h2>
        <div className="mt-4">
          <TankSpecsFields specs={specs} onChange={setSpecs} />
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:text-stone-950"
        >
          {submitting
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : "Add to catalog"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted hover:bg-card-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
