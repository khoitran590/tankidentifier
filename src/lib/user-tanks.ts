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
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirestoreDb, getFirebaseStorage } from "@/lib/firebase";
import type { TankSpecs } from "@/types/tank";
import type { UserTank } from "@/types/user-tank";

export type CreateUserTankInput = {
  name: string;
  imageUrl?: string;
  imageFile?: File | null;
  specs: TankSpecs;
};

type UserTankDoc = {
  name: string;
  slug: string;
  imageUrl: string;
  specs: TankSpecs;
  createdAt?: unknown;
  updatedAt?: unknown;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

function normalizeSpecs(specs: TankSpecs): TankSpecs {
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

function docToUserTank(id: string, ownerId: string, data: UserTankDoc): UserTank {
  const url = data.imageUrl;
  return {
    id,
    slug: data.slug,
    name: data.name,
    images: [url],
    thumbnail: url,
    specs: data.specs,
    ownerId,
  };
}

function tanksCollection(uid: string) {
  return collection(getFirestoreDb(), "users", uid, "tanks");
}

export function userTankPath(id: string): string {
  return `/my-tanks/${id}`;
}

export async function uploadTankImage(
  uid: string,
  tankId: string,
  file: File,
): Promise<string> {
  const storage = getFirebaseStorage();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `users/${uid}/tanks/${tankId}/cover.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function listUserTanks(uid: string): Promise<UserTank[]> {
  const q = query(tanksCollection(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    docToUserTank(d.id, uid, d.data() as UserTankDoc),
  );
}

export async function getUserTank(
  uid: string,
  tankId: string,
): Promise<UserTank | null> {
  const snap = await getDoc(doc(tanksCollection(uid), tankId));
  if (!snap.exists()) return null;
  return docToUserTank(snap.id, uid, snap.data() as UserTankDoc);
}

export async function createUserTank(
  uid: string,
  input: CreateUserTankInput,
): Promise<string> {
  const name = input.name.trim();
  if (!name) throw new Error("Tank name is required.");

  const col = tanksCollection(uid);
  const ref = doc(col);
  const tankId = ref.id;

  let imageUrl = input.imageUrl?.trim() ?? "";
  if (input.imageFile) {
    imageUrl = await uploadTankImage(uid, tankId, input.imageFile);
  }
  if (!imageUrl) {
    throw new Error("Add a photo (upload a file or paste an image URL).");
  }

  const specs = normalizeSpecs(input.specs);
  await setDoc(ref, {
    name,
    slug: `${slugify(name)}_${tankId.slice(0, 6)}`,
    imageUrl,
    specs,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return tankId;
}

export async function deleteUserTank(uid: string, tankId: string): Promise<void> {
  await deleteDoc(doc(tanksCollection(uid), tankId));
}
