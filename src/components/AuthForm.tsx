"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/auth-errors";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-ring";

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, configured } = useAuth();
  const nextUrl = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isSignup) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      router.push(nextUrl.startsWith("/") ? nextUrl : "/");
      router.refresh();
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card-muted p-6 text-sm text-muted">
        <p className="font-medium text-heading">Firebase not configured</p>
        <p className="mt-2">
          Add your Firebase keys to <code className="text-foreground">.env.local</code>{" "}
          (see <code className="text-foreground">.env.example</code> and{" "}
          <code className="text-foreground">docs/FIREBASE.md</code>).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignup && (
        <label className="block text-sm">
          <span className="font-medium text-heading">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            placeholder="Optional"
            className={inputClass}
          />
        </label>
      )}

      <label className="block text-sm">
        <span className="font-medium text-heading">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-heading">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={6}
          placeholder="At least 6 characters"
          className={inputClass}
        />
      </label>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50 dark:text-stone-950"
      >
        {submitting
          ? isSignup
            ? "Creating account…"
            : "Signing in…"
          : isSignup
            ? "Create account"
            : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              Log in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
