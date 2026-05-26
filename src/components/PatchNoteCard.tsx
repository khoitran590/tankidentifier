import Link from "next/link";
import { tankPath } from "@/lib/tanks";
import type { PatchNote } from "@/types/patch-note";

type Props = {
  note: PatchNote;
  showAdminActions?: boolean;
  onDelete?: (id: string) => void;
  deleting?: boolean;
};

export function PatchNoteCard({ note, showAdminActions, onDelete, deleting }: Props) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          {note.version && (
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {note.version}
            </p>
          )}
          <h2 className="mt-1 text-xl font-semibold text-heading">
            {note.title || "Patch update"}
          </h2>
          <p className="mt-1 text-sm text-muted">{note.publishedAt}</p>
        </div>
        {showAdminActions && (
          <div className="flex gap-2">
            <Link
              href={`/patch-notes/${note.id}/edit`}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-card-muted"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                type="button"
                disabled={deleting}
                onClick={() => onDelete(note.id)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-red-500/50 hover:text-red-500 disabled:opacity-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
            )}
          </div>
        )}
      </header>

      <p className="mt-4 text-sm leading-relaxed text-foreground">{note.summary}</p>

      {note.newTanks.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-heading">New tanks</h3>
          <ul className="mt-3 space-y-2">
            {note.newTanks.map((tank, i) => (
              <li
                key={`${tank.name}-${i}`}
                className="rounded-lg border border-border bg-card-muted px-4 py-3 text-sm"
              >
                {tank.slug ? (
                  <Link
                    href={tankPath(tank.slug)}
                    className="font-medium text-accent hover:text-accent-hover"
                  >
                    {tank.name}
                  </Link>
                ) : (
                  <span className="font-medium text-heading">{tank.name}</span>
                )}
                {tank.country && (
                  <span className="ml-2 text-muted">· {tank.country}</span>
                )}
                {tank.note && <p className="mt-1 text-muted">{tank.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {note.specUpdates.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-heading">Specification updates</h3>
          <ul className="mt-3 space-y-2">
            {note.specUpdates.map((item, i) => (
              <li
                key={`${item.tankName}-${i}`}
                className="rounded-lg border border-border bg-card-muted px-4 py-3 text-sm"
              >
                {item.slug ? (
                  <Link
                    href={tankPath(item.slug)}
                    className="font-medium text-accent hover:text-accent-hover"
                  >
                    {item.tankName}
                  </Link>
                ) : (
                  <span className="font-medium text-heading">{item.tankName}</span>
                )}
                <p className="mt-1 text-muted">{item.change}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
