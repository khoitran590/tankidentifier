"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminUid } from "@/lib/admin";
import { getFirestoreDb } from "@/lib/firebase";

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (isAdminUid(user.uid)) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const snap = await getDoc(doc(getFirestoreDb(), "users", user!.uid));
        const flag = snap.exists() && snap.data()?.isAdmin === true;
        if (!cancelled) setIsAdmin(flag);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || loading };
}
