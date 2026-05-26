import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type FirestoreUser = {
  email: string;
  displayName: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

/** Creates or updates the user profile (safe to call again after a partial signup). */
export async function ensureUserProfile(
  uid: string,
  data: { email: string; displayName: string },
): Promise<void> {
  const db = getFirestoreDb();
  await setDoc(
    doc(db, "users", uid),
    {
      email: data.email,
      displayName: data.displayName,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
