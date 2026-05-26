"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PatchNoteCard } from "@/components/PatchNoteCard";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { deletePatchNote, listPatchNotes } from "@/lib/patch-notes";
import type { PatchNote } from "@/types/patch-note";

export function PatchNotesPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [notes, setNotes] = useState<PatchNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotes(await listPatchNotes());
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this patch note?")) return;
    setDeletingId(id);
    try {
      await deletePatchNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {isAdmin && !adminLoading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-muted/40 px-4 py-3">
          <p className="text-sm text-accent-foreground">
            Admin: publish catalog updates for everyone to read.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/catalog"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-card-muted"
            >
              Manage catalog
            </Link>
            <Link
              href="/admin/catalog/new"
              className="rounded-lg border border-accent/50 bg-card px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-muted"
            >
              + Add catalog tank
            </Link>
            <Link
              href="/patch-notes/new"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
            >
              + New patch note
            </Link>
          </div>
        </div>
      )}

      {loading && <p className="text-muted">Loading patch notes…</p>}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && notes.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card-muted px-6 py-12 text-center text-muted">
          <p>No patch notes yet.</p>
          {isAdmin && (
            <Link
              href="/patch-notes/new"
              className="mt-4 inline-block font-medium text-accent hover:text-accent-hover"
            >
              Publish the first update →
            </Link>
          )}
        </div>
      )}

      <div className="space-y-8">
        {notes.map((note) => (
          <PatchNoteCard
            key={note.id}
            note={note}
            showAdminActions={isAdmin}
            onDelete={isAdmin ? handleDelete : undefined}
            deleting={deletingId === note.id}
          />
        ))}
      </div>
    </div>
  );
}
