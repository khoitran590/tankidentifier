import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirestoreDb, getFirebaseStorage } from "@/lib/firebase";
import type { Tank, TankSpecs } from "@/types/tank";
import { normalizeSpecs, type CatalogTankPhotosInput } from "@/lib/catalog-tanks";

export type TankOverrideDoc = {
  name?: string;
  specs?: TankSpecs;
  imageUrls?: string[];
  updatedAt?: unknown;
};

export type SaveTankOverrideInput = {
  name: string;
  specs: TankSpecs;
  photos: CatalogTankPhotosInput;
};

const COLLECTION = "tankOverrides";

function overrideRef(slug: string) {
  return doc(getFirestoreDb(), COLLECTION, slug);
}

function uniqueUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const url = raw.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}

export async function uploadTankOverrideImage(
  slug: string,
  file: File,
  index: number,
): Promise<string> {
  const storage = getFirebaseStorage();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `tankOverrides/${slug}/photo_${Date.now()}_${index}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function resolveOverridePhotos(
  slug: string,
  photos: CatalogTankPhotosInput,
): Promise<string[]> {
  const kept = uniqueUrls(photos.keepUrls ?? []);
  const pasted = uniqueUrls(photos.pasteUrls ?? []);
  const files = photos.uploadFiles ?? [];

  const uploaded: string[] = [];
  for (let i = 0; i < files.length; i++) {
    uploaded.push(await uploadTankOverrideImage(slug, files[i], i));
  }

  return uniqueUrls([...kept, ...uploaded, ...pasted]);
}

export async function listTankOverrides(): Promise<Map<string, TankOverrideDoc>> {
  const snap = await getDocs(collection(getFirestoreDb(), COLLECTION));
  const map = new Map<string, TankOverrideDoc>();
  for (const d of snap.docs) {
    map.set(d.id, d.data() as TankOverrideDoc);
  }
  return map;
}

export async function getTankOverride(slug: string): Promise<TankOverrideDoc | null> {
  const snap = await getDoc(overrideRef(slug));
  if (!snap.exists()) return null;
  return snap.data() as TankOverrideDoc;
}

export function applyOverrideToTank(tank: Tank, override: TankOverrideDoc | null): Tank {
  if (!override) return tank;

  const imageUrls =
    override.imageUrls && override.imageUrls.length > 0
      ? override.imageUrls
      : tank.images;

  return {
    ...tank,
    name: override.name?.trim() || tank.name,
    specs: override.specs ?? tank.specs,
    images: imageUrls,
    thumbnail: imageUrls[0] ?? tank.thumbnail,
    source: tank.source,
  };
}

export function applyOverridesToTanks(
  tanks: Tank[],
  overrides: Map<string, TankOverrideDoc>,
): Tank[] {
  return tanks.map((t) => applyOverrideToTank(t, overrides.get(t.slug) ?? null));
}

export async function saveTankOverride(
  slug: string,
  input: SaveTankOverrideInput,
): Promise<void> {
  const name = input.name.trim();
  if (!name) throw new Error("Tank name is required.");

  const imageUrls = await resolveOverridePhotos(slug, input.photos);
  if (imageUrls.length === 0) {
    throw new Error("Keep or add at least one photo.");
  }

  await setDoc(
    overrideRef(slug),
    {
      name,
      specs: normalizeSpecs(input.specs),
      imageUrls,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
