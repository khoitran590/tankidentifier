"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ensureUserProfile } from "@/lib/auth-users";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistUserProfile(
  user: User,
  email: string,
  displayName: string,
): Promise<void> {
  const name = displayName.trim() || email.split("@")[0];
  if (name !== user.displayName) {
    await updateProfile(user, { displayName: name });
  }
  await ensureUserProfile(user.uid, {
    email: user.email ?? email.trim(),
    displayName: name,
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );
    await persistUserProfile(
      credential.user,
      email,
      credential.user.displayName ?? email.split("@")[0],
    );
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getFirebaseAuth();
      const trimmedEmail = email.trim();
      const name = displayName.trim() || trimmedEmail.split("@")[0];

      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password,
        );
        await persistUserProfile(credential.user, trimmedEmail, name);
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";

        // Auth succeeded earlier but Firestore failed — finish profile on retry
        if (code === "auth/email-already-in-use" && auth.currentUser) {
          await persistUserProfile(auth.currentUser, trimmedEmail, name);
          return;
        }

        if (code === "auth/email-already-in-use") {
          const credential = await signInWithEmailAndPassword(
            auth,
            trimmedEmail,
            password,
          );
          await persistUserProfile(credential.user, trimmedEmail, name);
          return;
        }

        throw err;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading, configured, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
