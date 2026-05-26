import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";
import { AuthPageGuard } from "@/components/AuthPageGuard";
import { PageShell } from "@/components/PageShell";

export const metadata = {
  title: "Log in — Tank Identifier",
  description: "Sign in to your Tank Identifier account.",
};

function LoginForm() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow-md sm:p-8">
      <AuthPageGuard>
        <AuthForm mode="login" />
      </AuthPageGuard>
      <p className="mt-6 text-center text-xs text-subtle">
        <Link href="/" className="text-accent hover:text-accent-hover">
          ← Back to catalog
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Log in" },
      ]}
      title="Log in"
      description="Access your account and manage your custom tanks."
    >
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
