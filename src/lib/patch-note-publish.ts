import {
  createCatalogTank,
  normalizeSpecs,
  updateCatalogTank,
  type CreateCatalogTankInput,
  type CatalogTankPhotosInput,
} from "@/lib/catalog-tanks";
import { createPatchNote, updatePatchNote, type PatchNoteInput } from "@/lib/patch-notes";
import { saveTankOverride } from "@/lib/tank-overrides";
import type { TankSpecs } from "@/types/tank";
import type { SpecUpdate, TankAddition } from "@/types/patch-note";

export type CatalogTankEditPayload = {
  slug: string;
  source: "static" | "catalog";
  catalogId?: string;
  name: string;
  specs: TankSpecs;
  photos: CatalogTankPhotosInput;
  changeNote?: string;
};

export type PatchNotePublishPayload = {
  note: PatchNoteInput;
  catalogAdds: CreateCatalogTankInput[];
  catalogEdits: CatalogTankEditPayload[];
};

function summarizeSpecChange(
  name: string,
  slug: string,
  note?: string,
): SpecUpdate {
  return {
    tankName: name,
    slug,
    change: note?.trim() || "Specifications and/or photos updated in the catalog.",
  };
}

export async function publishPatchNote(
  payload: PatchNotePublishPayload,
  createdBy?: string,
): Promise<string> {
  const addedChangelog: TankAddition[] = [];
  const editChangelog: SpecUpdate[] = [];

  for (const draft of payload.catalogAdds) {
    const { slug } = await createCatalogTank(draft, createdBy);
    addedChangelog.push({
      name: draft.name.trim(),
      slug,
      country: draft.specs.country,
      note: "Added to catalog",
    });
  }

  for (const edit of payload.catalogEdits) {
    const specs = normalizeSpecs(edit.specs);
    if (edit.source === "catalog" && edit.catalogId) {
      await updateCatalogTank(edit.catalogId, {
        name: edit.name,
        specs,
        photos: edit.photos,
      });
    } else {
      await saveTankOverride(edit.slug, {
        name: edit.name,
        specs,
        photos: edit.photos,
      });
    }
    editChangelog.push(
      summarizeSpecChange(edit.name, edit.slug, edit.changeNote),
    );
  }

  const noteInput: PatchNoteInput = {
    ...payload.note,
    newTanks: [...payload.note.newTanks, ...addedChangelog],
    specUpdates: [...payload.note.specUpdates, ...editChangelog],
  };

  return createPatchNote(noteInput);
}

export async function updatePublishedPatchNote(
  id: string,
  payload: PatchNotePublishPayload,
  createdBy?: string,
): Promise<void> {
  const addedChangelog: TankAddition[] = [];
  const editChangelog: SpecUpdate[] = [];

  for (const draft of payload.catalogAdds) {
    const { slug } = await createCatalogTank(draft, createdBy);
    addedChangelog.push({
      name: draft.name.trim(),
      slug,
      country: draft.specs.country,
      note: "Added to catalog",
    });
  }

  for (const edit of payload.catalogEdits) {
    const specs = normalizeSpecs(edit.specs);
    if (edit.source === "catalog" && edit.catalogId) {
      await updateCatalogTank(edit.catalogId, {
        name: edit.name,
        specs,
        photos: edit.photos,
      });
    } else {
      await saveTankOverride(edit.slug, {
        name: edit.name,
        specs,
        photos: edit.photos,
      });
    }
    editChangelog.push(
      summarizeSpecChange(edit.name, edit.slug, edit.changeNote),
    );
  }

  const noteInput: PatchNoteInput = {
    ...payload.note,
    newTanks: [...payload.note.newTanks, ...addedChangelog],
    specUpdates: [...payload.note.specUpdates, ...editChangelog],
  };

  await updatePatchNote(id, noteInput);
}
