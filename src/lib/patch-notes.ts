import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { PatchNote, SpecUpdate, TankAddition } from "@/types/patch-note";

export type PatchNoteInput = {
  title: string;
  version: string;
  summary: string;
  newTanks: TankAddition[];
  specUpdates: SpecUpdate[];
};

type PatchNoteDoc = PatchNoteInput & {
  publishedAt: Timestamp;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function notesCollection() {
  return collection(getFirestoreDb(), "patchNotes");
}

function formatDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function docToPatchNote(id: string, data: PatchNoteDoc): PatchNote {
  return {
    id,
    title: data.title,
    version: data.version,
    summary: data.summary,
    newTanks: data.newTanks ?? [],
    specUpdates: data.specUpdates ?? [],
    publishedAt: formatDate(data.publishedAt),
  };
}

export async function listPatchNotes(): Promise<PatchNote[]> {
  const q = query(notesCollection(), orderBy("publishedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPatchNote(d.id, d.data() as PatchNoteDoc));
}

export async function getPatchNote(id: string): Promise<PatchNote | null> {
  const snap = await getDoc(doc(notesCollection(), id));
  if (!snap.exists()) return null;
  return docToPatchNote(snap.id, snap.data() as PatchNoteDoc);
}

export async function createPatchNote(input: PatchNoteInput): Promise<string> {
  const summary = input.summary.trim();
  if (!summary) {
    throw new Error("Summary is required.");
  }

  const ref = await addDoc(notesCollection(), {
    title: input.title.trim() || "Patch update",
    version: input.version.trim(),
    summary,
    newTanks: input.newTanks.filter((t) => t.name.trim()),
    specUpdates: input.specUpdates.filter((s) => s.tankName.trim()),
    publishedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePatchNote(
  id: string,
  input: PatchNoteInput,
): Promise<void> {
  const summary = input.summary.trim();
  if (!summary) {
    throw new Error("Summary is required.");
  }

  await updateDoc(doc(notesCollection(), id), {
    title: input.title.trim() || "Patch update",
    version: input.version.trim(),
    summary,
    newTanks: input.newTanks.filter((t) => t.name.trim()),
    specUpdates: input.specUpdates.filter((s) => s.tankName.trim()),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePatchNote(id: string): Promise<void> {
  await deleteDoc(doc(notesCollection(), id));
}
