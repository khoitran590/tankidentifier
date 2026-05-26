"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PatchNoteCatalogSection,
  type CatalogAddDraft,
  type CatalogEditDraft,
} from "@/components/PatchNoteCatalogSection";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import type { PatchNoteInput } from "@/lib/patch-notes";
import {
  publishPatchNote,
  updatePublishedPatchNote,
} from "@/lib/patch-note-publish";
import { useAuth } from "@/contexts/AuthContext";
import type { PatchNote, SpecUpdate, TankAddition } from "@/types/patch-note";

type Props = {
  initial?: PatchNote;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

function emptyTank(): TankAddition {
  return { name: "", slug: "", country: "", note: "" };
}

function emptySpec(): SpecUpdate {
  return { tankName: "", slug: "", change: "" };
}

export function PatchNoteForm({ initial }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [version, setVersion] = useState(initial?.version ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [newTanks, setNewTanks] = useState<TankAddition[]>(
    initial?.newTanks.length ? initial.newTanks : [],
  );
  const [specUpdates, setSpecUpdates] = useState<SpecUpdate[]>(
    initial?.specUpdates.length ? initial.specUpdates : [],
  );
  const [catalogAdds, setCatalogAdds] = useState<CatalogAddDraft[]>([]);
  const [catalogEdits, setCatalogEdits] = useState<CatalogEditDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function buildNoteInput(): PatchNoteInput {
    return {
      title: title.trim(),
      version: version.trim(),
      summary: summary.trim(),
      newTanks: newTanks.filter((t) => t.name.trim()),
      specUpdates: specUpdates.filter((s) => s.tankName.trim()),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      note: buildNoteInput(),
      catalogAdds: catalogAdds.filter((d) => d.name.trim()),
      catalogEdits: catalogEdits.filter((d) => d.slug && d.name.trim()),
    };

    try {
      if (isEdit && initial) {
        await updatePublishedPatchNote(initial.id, payload, user?.uid);
      } else {
        await publishPatchNote(payload, user?.uid);
      }
      router.push("/patch-notes");
      router.refresh();
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-heading">Update info</h2>
        <label className="block text-sm">
          <span className="font-medium">Title (optional)</span>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spring 2026 catalog expansion"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Version label (optional)</span>
          <input
            className={inputClass}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g. v1.2.0"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Summary</span>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What changed in this update?"
            required
          />
        </label>
      </section>

      <PatchNoteCatalogSection
        catalogAdds={catalogAdds}
        onCatalogAddsChange={setCatalogAdds}
        catalogEdits={catalogEdits}
        onCatalogEditsChange={setCatalogEdits}
      />

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-heading">Extra changelog mentions</h2>
            <p className="mt-1 text-sm text-muted">
              Optional text-only rows (tanks already handled above are listed automatically).
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewTanks((t) => [...t, emptyTank()])}
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            + Mention new tank
          </button>
          <button
            type="button"
            onClick={() => setSpecUpdates((s) => [...s, emptySpec()])}
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            + Mention spec change
          </button>
        </div>
        {(newTanks.length > 0 || specUpdates.length > 0) && (
          <div className="mt-4 space-y-6">
            {newTanks.map((tank, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-border bg-card-muted p-4 sm:grid-cols-2"
              >
                <input
                  className={inputClass}
                  placeholder="Tank name *"
                  value={tank.name}
                  onChange={(e) => {
                    const next = [...newTanks];
                    next[index] = { ...tank, name: e.target.value };
                    setNewTanks(next);
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Slug (optional)"
                  value={tank.slug ?? ""}
                  onChange={(e) => {
                    const next = [...newTanks];
                    next[index] = { ...tank, slug: e.target.value };
                    setNewTanks(next);
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Country"
                  value={tank.country ?? ""}
                  onChange={(e) => {
                    const next = [...newTanks];
                    next[index] = { ...tank, country: e.target.value };
                    setNewTanks(next);
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Short note"
                  value={tank.note ?? ""}
                  onChange={(e) => {
                    const next = [...newTanks];
                    next[index] = { ...tank, note: e.target.value };
                    setNewTanks(next);
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-muted hover:text-red-500 sm:col-span-2"
                  onClick={() => setNewTanks((t) => t.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
            {specUpdates.map((item, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border bg-card-muted p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="Tank name *"
                    value={item.tankName}
                    onChange={(e) => {
                      const next = [...specUpdates];
                      next[index] = { ...item, tankName: e.target.value };
                      setSpecUpdates(next);
                    }}
                  />
                  <input
                    className={inputClass}
                    placeholder="Slug (optional)"
                    value={item.slug ?? ""}
                    onChange={(e) => {
                      const next = [...specUpdates];
                      next[index] = { ...item, slug: e.target.value };
                      setSpecUpdates(next);
                    }}
                  />
                </div>
                <textarea
                  className={`${inputClass} min-h-[72px]`}
                  placeholder="What changed?"
                  value={item.change}
                  onChange={(e) => {
                    const next = [...specUpdates];
                    next[index] = { ...item, change: e.target.value };
                    setSpecUpdates(next);
                  }}
                />
                <button
                  type="button"
                  className="text-xs text-muted hover:text-red-500"
                  onClick={() => setSpecUpdates((s) => s.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
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
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:text-stone-950"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Publish update"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/patch-notes")}
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-card-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
