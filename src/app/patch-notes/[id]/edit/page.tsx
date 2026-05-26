"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PatchNoteForm } from "@/components/PatchNoteForm";
import { PageShell } from "@/components/PageShell";
import { RequireAdmin } from "@/components/RequireAdmin";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getPatchNote } from "@/lib/patch-notes";
import type { PatchNote } from "@/types/patch-note";

export default function EditPatchNotePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [note, setNote] = useState<PatchNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getPatchNote(id);
      setNote(data);
      if (!data) setError("Patch note not found.");
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
        { label: "Home", href: "/" },
        { label: "Patch notes", href: "/patch-notes" },
        { label: "Edit" },
      ]}
      title="Edit patch note"
    >
      <RequireAdmin>
        {loading && <p className="text-muted">Loading…</p>}
        {error && (
          <p className="text-muted">
            {error}{" "}
            <Link href="/patch-notes" className="text-accent">
              Back
            </Link>
          </p>
        )}
        {note && <PatchNoteForm initial={note} />}
      </RequireAdmin>
    </PageShell>
  );
}
