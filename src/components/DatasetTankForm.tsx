"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CatalogTankPhotosEditor } from "@/components/CatalogTankPhotosEditor";
import { TankSpecsFields } from "@/components/TankSpecsFields";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import type { CatalogTankPhotosInput } from "@/lib/catalog-tanks";
import { saveTankOverride } from "@/lib/tank-overrides";
import { tankPath } from "@/lib/tanks";
import type { Tank } from "@/types/tank";

type Props = {
  tank: Tank;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function DatasetTankForm({ tank }: Props) {
  const router = useRouter();
  const [name, setName] = useState(tank.name);
  const [specs, setSpecs] = useState(tank.specs);
  const [photos, setPhotos] = useState<CatalogTankPhotosInput>({
    keepUrls: [...tank.images],
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
      await saveTankOverride(tank.slug, { name, specs, photos });
      router.push(tankPath(tank.slug));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Dataset tank</h2>
        <p className="mt-1 text-sm text-muted">
          Overrides apply on top of the built-in catalog entry for{" "}
          <code className="text-xs">{tank.slug}</code>.
        </p>
        <label className="mt-4 block text-sm">
          <span className="font-medium text-heading">Name</span>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Photos</h2>
        <div className="mt-4">
          <CatalogTankPhotosEditor initialUrls={tank.images} onChange={onPhotosChange} />
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
          {submitting ? "Saving…" : "Save override"}
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
