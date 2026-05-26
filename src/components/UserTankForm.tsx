"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TankSpecsFields } from "@/components/TankSpecsFields";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { createUserTank } from "@/lib/user-tanks";
import { EMPTY_TANK_SPECS } from "@/types/user-tank";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function UserTankForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [specs, setSpecs] = useState(EMPTY_TANK_SPECS);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onFileChange(file: File | null) {
    setImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setImageUrl("");
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSubmitting(true);

    try {
      const id = await createUserTank(user.uid, {
        name,
        imageUrl,
        imageFile,
        specs,
      });
      router.push(`/my-tanks/${id}`);
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
        <h2 className="text-lg font-semibold text-heading">Tank details</h2>
        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-heading">Name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Custom MBT Concept"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-heading">Upload photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-accent-muted file:px-3 file:py-1 file:text-sm file:text-accent`}
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-heading">Or image URL</span>
              <input
                type="url"
                className={inputClass}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) onFileChange(null);
                }}
                placeholder="https://…"
                disabled={Boolean(imageFile)}
              />
            </label>
          </div>

          {(preview || imageUrl) && (
            <div className="relative aspect-video max-w-md overflow-hidden rounded-xl border border-border bg-card-muted">
              <Image
                src={preview ?? imageUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="400px"
                unoptimized={Boolean(preview)}
              />
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-heading">Specifications</h2>
        <p className="mt-1 text-sm text-muted">
          Same fields as the main catalog. Values are stored in your Firestore profile.
        </p>
        <div className="mt-6">
          <TankSpecsFields specs={specs} onChange={setSpecs} />
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50 dark:text-stone-950"
        >
          {submitting ? "Saving…" : "Save to My tanks"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/my-tanks")}
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-card-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
