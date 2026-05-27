import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { getAllTanks } from "@/lib/tanks";
import { getFirestoreDb, getFirebaseStorage } from "@/lib/firebase";
import type { Tank, TankSpecs } from "@/types/tank";

export type CatalogTankPhotosInput = {
  /** Existing URLs to keep (edit mode). */
  keepUrls?: string[];
  uploadFiles?: File[];
  pasteUrls?: string[];
};

export type CreateCatalogTankInput = {
  name: string;
  specs: TankSpecs;
  photos: CatalogTankPhotosInput;
};

export type UpdateCatalogTankInput = {
  name: string;
  specs: TankSpecs;
  photos: CatalogTankPhotosInput;
};

type CatalogTankDoc = {
  name: string;
  slug: string;
  imageUrl?: string;
  imageUrls?: string[];
  specs: TankSpecs;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
};

const COLLECTION = "catalogTanks";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

export function normalizeSpecs(specs: TankSpecs): TankSpecs {
  const weight = Number(specs.weight_t) || 0;
  const power = Number(specs.power_hp) || 0;
  const ptw =
    Number(specs.power_to_weight_hp_t) ||
    (weight > 0 ? Math.round((power / weight) * 10) / 10 : 0);

  return {
    country: specs.country.trim(),
    era: specs.era.trim(),
    type: specs.type.trim(),
    weight_t: weight,
    length_m: Number(specs.length_m) || 0,
    width_m: Number(specs.width_m) || 0,
    height_m: Number(specs.height_m) || 0,
    crew: Number(specs.crew) || 0,
    main_gun: specs.main_gun.trim(),
    secondary: specs.secondary?.trim() || undefined,
    engine: specs.engine.trim(),
    power_hp: power,
    power_to_weight_hp_t: ptw,
    max_speed_kmh: Number(specs.max_speed_kmh) || 0,
    range_km: Number(specs.range_km) || 0,
    armor: specs.armor.trim(),
  };
}

function resolveImageUrls(data: CatalogTankDoc): string[] {
  if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
    return data.imageUrls.filter(Boolean);
  }
  if (data.imageUrl) return [data.imageUrl];
  return [];
}

function docToTank(id: string, data: CatalogTankDoc): Tank {
  const urls = resolveImageUrls(data);
  const thumbnail = urls[0] ?? "";
  return {
    id,
    slug: data.slug,
    name: data.name,
    images: urls,
    thumbnail,
    specs: data.specs,
    source: "catalog",
  };
}

function catalogCollection() {
  return collection(getFirestoreDb(), COLLECTION);
}

function catalogDocRef(tankId: string) {
  return doc(getFirestoreDb(), COLLECTION, tankId);
}

const staticSlugSet = () => new Set(getAllTanks().map((t) => t.slug));

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  if (staticSlugSet().has(slug)) return true;
  const q = query(catalogCollection(), where("slug", "==", slug));
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.id !== excludeId);
}

async function uniqueSlug(baseName: string, tankId: string): Promise<string> {
  let candidate = slugify(baseName);
  if (!candidate) candidate = `tank_${tankId.slice(0, 8)}`;
  if (!(await isSlugTaken(candidate))) return candidate;
  const withSuffix = `${candidate}_${tankId.slice(0, 6)}`;
  if (!(await isSlugTaken(withSuffix))) return withSuffix;
  throw new Error("Could not generate a unique slug. Try a different name.");
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

export async function uploadCatalogTankImage(
  tankId: string,
  file: File,
  index: number,
): Promise<string> {
  const storage = getFirebaseStorage();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `catalog/${tankId}/photo_${Date.now()}_${index}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

async function resolvePhotoUrls(
  tankId: string,
  photos: CatalogTankPhotosInput,
): Promise<string[]> {
  const kept = uniqueUrls(photos.keepUrls ?? []);
  const pasted = uniqueUrls(photos.pasteUrls ?? []);
  const files = photos.uploadFiles ?? [];

  const uploaded: string[] = [];
  for (let i = 0; i < files.length; i++) {
    uploaded.push(await uploadCatalogTankImage(tankId, files[i], i));
  }

  return uniqueUrls([...kept, ...uploaded, ...pasted]);
}

export async function listCatalogTanks(): Promise<Tank[]> {
  const q = query(catalogCollection(), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToTank(d.id, d.data() as CatalogTankDoc));
}

export async function getCatalogTankById(tankId: string): Promise<Tank | null> {
  const snap = await getDoc(catalogDocRef(tankId));
  if (!snap.exists()) return null;
  return docToTank(snap.id, snap.data() as CatalogTankDoc);
}

export async function getCatalogTankBySlug(slug: string): Promise<Tank | null> {
  const q = query(catalogCollection(), where("slug", "==", slug));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  return docToTank(first.id, first.data() as CatalogTankDoc);
}

export async function createCatalogTank(
  input: CreateCatalogTankInput,
  createdBy?: string,
): Promise<{ id: string; slug: string }> {
  const name = input.name.trim();
  if (!name) throw new Error("Tank name is required.");

  const ref = doc(catalogCollection());
  const tankId = ref.id;
  const slug = await uniqueSlug(name, tankId);

  const imageUrls = await resolvePhotoUrls(tankId, input.photos);
  if (imageUrls.length === 0) {
    throw new Error("Add at least one photo (upload files or paste image URLs).");
  }

  const specs = normalizeSpecs(input.specs);
  await setDoc(ref, {
    name,
    slug,
    imageUrls,
    specs,
    createdBy: createdBy ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: tankId, slug };
}

export async function updateCatalogTank(
  tankId: string,
  input: UpdateCatalogTankInput,
): Promise<{ slug: string }> {
  const name = input.name.trim();
  if (!name) throw new Error("Tank name is required.");

  const existing = await getCatalogTankById(tankId);
  if (!existing) throw new Error("Catalog tank not found.");

  const imageUrls = await resolvePhotoUrls(tankId, input.photos);
  if (imageUrls.length === 0) {
    throw new Error("Keep or add at least one photo.");
  }

  const specs = normalizeSpecs(input.specs);
  await updateDoc(catalogDocRef(tankId), {
    name,
    imageUrls,
    specs,
    updatedAt: serverTimestamp(),
  });
  return { slug: existing.slug };
}

async function deleteCatalogTankStorage(tankId: string): Promise<void> {
  const storage = getFirebaseStorage();
  const folderRef = ref(storage, `catalog/${tankId}`);
  try {
    const listing = await listAll(folderRef);
    await Promise.all(listing.items.map((item) => deleteObject(item)));
    await Promise.all(
      listing.prefixes.map(async (prefix) => {
        const nested = await listAll(prefix);
        await Promise.all(nested.items.map((item) => deleteObject(item)));
      }),
    );
  } catch {
    // Uploaded files may be absent if only external URLs were used.
  }
}

export async function deleteCatalogTank(tankId: string): Promise<void> {
  const existing = await getCatalogTankById(tankId);
  if (!existing) throw new Error("Catalog tank not found.");

  await deleteDoc(catalogDocRef(tankId));
  await deleteCatalogTankStorage(tankId);
}

export function catalogTankEditPath(tankId: string): string {
  return `/admin/catalog/${tankId}/edit`;
}
