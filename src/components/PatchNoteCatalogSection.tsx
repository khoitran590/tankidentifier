"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { CatalogTankPhotosEditor } from "@/components/CatalogTankPhotosEditor";
import { TankPicker } from "@/components/TankPicker";
import { TankSpecsFields } from "@/components/TankSpecsFields";
import { useMergedCatalogTanks } from "@/hooks/useMergedCatalogTanks";
import type { CatalogTankPhotosInput, CreateCatalogTankInput } from "@/lib/catalog-tanks";
import type { CatalogTankEditPayload } from "@/lib/patch-note-publish";
import { getAllTanks } from "@/lib/tanks";
import type { Tank, TankSpecs } from "@/types/tank";
import { EMPTY_TANK_SPECS } from "@/types/user-tank";

export type CatalogAddDraft = CreateCatalogTankInput & { key: string };

export type CatalogEditDraft = CatalogTankEditPayload & { key: string };

type Props = {
  catalogAdds: CatalogAddDraft[];
  onCatalogAddsChange: Dispatch<SetStateAction<CatalogAddDraft[]>>;
  catalogEdits: CatalogEditDraft[];
  onCatalogEditsChange: Dispatch<SetStateAction<CatalogEditDraft[]>>;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

function newKey() {
  return `k_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function emptyAdd(): CatalogAddDraft {
  return {
    key: newKey(),
    name: "",
    specs: { ...EMPTY_TANK_SPECS },
    photos: { keepUrls: [], uploadFiles: [], pasteUrls: [""] },
  };
}

function emptyEdit(): CatalogEditDraft {
  return {
    key: newKey(),
    slug: "",
    source: "static",
    name: "",
    specs: { ...EMPTY_TANK_SPECS },
    photos: { keepUrls: [], uploadFiles: [], pasteUrls: [] },
    changeNote: "",
  };
}

function tankToEditDraft(tank: Tank): CatalogEditDraft {
  return {
    key: newKey(),
    slug: tank.slug,
    source: tank.source === "catalog" ? "catalog" : "static",
    catalogId: tank.source === "catalog" ? tank.id : undefined,
    name: tank.name,
    specs: { ...tank.specs },
    photos: {
      keepUrls: [...tank.images],
      uploadFiles: [],
      pasteUrls: [],
    },
    changeNote: "",
  };
}

export function PatchNoteCatalogSection({
  catalogAdds,
  onCatalogAddsChange,
  catalogEdits,
  onCatalogEditsChange,
}: Props) {
  const staticTanks = getAllTanks();
  const { tanks, loading } = useMergedCatalogTanks(staticTanks);

  const updateAdd = useCallback(
    (key: string, patch: Partial<CatalogAddDraft>) => {
      onCatalogAddsChange((prev) =>
        prev.map((d) => (d.key === key ? { ...d, ...patch } : d)),
      );
    },
    [onCatalogAddsChange],
  );

  const updateEdit = useCallback(
    (key: string, patch: Partial<CatalogEditDraft>) => {
      onCatalogEditsChange((prev) =>
        prev.map((d) => (d.key === key ? { ...d, ...patch } : d)),
      );
    },
    [onCatalogEditsChange],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-accent/25 bg-accent-muted/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-heading">Add tanks to catalog</h2>
            <p className="mt-1 text-sm text-muted">
              Add one or many tanks in this release. Each becomes a live catalog entry with photos and specs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCatalogAddsChange((prev) => [...prev, emptyAdd()])}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white dark:text-stone-950"
          >
            + Add tank
          </button>
        </div>

        {catalogAdds.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No catalog tanks to add in this patch.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {catalogAdds.map((draft, index) => (
              <CatalogAddBlock
                key={draft.key}
                index={index}
                draft={draft}
                updateDraft={updateAdd}
                onRemove={() =>
                  onCatalogAddsChange((prev) => prev.filter((d) => d.key !== draft.key))
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-heading">Update existing catalog tanks</h2>
            <p className="mt-1 text-sm text-muted">
              Edit specs or add photos for tanks from the dataset or live catalog.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => onCatalogEditsChange((prev) => [...prev, emptyEdit()])}
            className="rounded-lg border border-accent/50 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-muted disabled:opacity-50"
          >
            + Update tank
          </button>
        </div>

        {catalogEdits.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No catalog updates in this patch.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {catalogEdits.map((draft, index) => (
              <CatalogEditBlock
                key={draft.key}
                index={index}
                draft={draft}
                tanks={tanks}
                loading={loading}
                updateDraft={updateEdit}
                onTankSelect={(tank) => {
                  const next = tankToEditDraft(tank);
                  updateEdit(draft.key, { ...next, key: draft.key, changeNote: draft.changeNote });
                }}
                onRemove={() =>
                  onCatalogEditsChange((prev) => prev.filter((d) => d.key !== draft.key))
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type AddBlockProps = {
  index: number;
  draft: CatalogAddDraft;
  updateDraft: (key: string, patch: Partial<CatalogAddDraft>) => void;
  onRemove: () => void;
};

function CatalogAddBlock({ index, draft, updateDraft, onRemove }: AddBlockProps) {
  const patch = useCallback(
    (p: Partial<CatalogAddDraft>) => updateDraft(draft.key, p),
    [draft.key, updateDraft],
  );

  const handlePhotosChange = useCallback(
    (photos: CatalogTankPhotosInput) => patch({ photos }),
    [patch],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-heading">New tank {index + 1}</h3>
        <button type="button" onClick={onRemove} className="text-xs text-muted hover:text-red-500">
          Remove
        </button>
      </div>
      <label className="block text-sm">
        <span className="font-medium">Name</span>
        <input
          className={inputClass}
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="e.g. T-90M"
          required
        />
      </label>
      <div className="mt-6">
        <p className="text-sm font-medium text-heading">Photos</p>
        <CatalogTankPhotosEditor key={draft.key} onChange={handlePhotosChange} />
      </div>
      <div className="mt-6">
        <p className="text-sm font-medium text-heading">Specifications</p>
        <div className="mt-3">
          <TankSpecsFields
            specs={draft.specs}
            onChange={(specs: TankSpecs) => patch({ specs })}
          />
        </div>
      </div>
    </div>
  );
}

type EditBlockProps = {
  index: number;
  draft: CatalogEditDraft;
  tanks: Tank[];
  loading: boolean;
  updateDraft: (key: string, patch: Partial<CatalogEditDraft>) => void;
  onTankSelect: (tank: Tank) => void;
  onRemove: () => void;
};

function CatalogEditBlock({
  index,
  draft,
  tanks,
  loading,
  updateDraft,
  onTankSelect,
  onRemove,
}: EditBlockProps) {
  const patch = useCallback(
    (p: Partial<CatalogEditDraft>) => updateDraft(draft.key, p),
    [draft.key, updateDraft],
  );

  const handlePhotosChange = useCallback(
    (photos: CatalogTankPhotosInput) => patch({ photos }),
    [patch],
  );

  const hasTank = Boolean(draft.slug);

  return (
    <div className="rounded-xl border border-border bg-card-muted p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-heading">Catalog update {index + 1}</h3>
        <button type="button" onClick={onRemove} className="text-xs text-muted hover:text-red-500">
          Remove
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading tank list…</p>
      ) : (
        <TankPicker
          tanks={tanks}
          value={draft.slug}
          onSelect={onTankSelect}
        />
      )}

      {hasTank && (
        <>
          <label className="mt-4 block text-sm">
            <span className="font-medium">Name</span>
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="font-medium">Changelog note (optional)</span>
            <input
              className={inputClass}
              value={draft.changeNote ?? ""}
              onChange={(e) => patch({ changeNote: e.target.value })}
              placeholder="e.g. Corrected weight and added side profile photo"
            />
          </label>
          <div className="mt-6">
            <p className="text-sm font-medium text-heading">Photos</p>
            <CatalogTankPhotosEditor
              key={`${draft.key}-${draft.slug}`}
              initialUrls={draft.photos.keepUrls}
              onChange={handlePhotosChange}
            />
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-heading">Specifications</p>
            <div className="mt-3">
              <TankSpecsFields
                specs={draft.specs}
                onChange={(specs: TankSpecs) => patch({ specs })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
