import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthPageGuard } from "@/components/AuthPageGuard";
import { PageShell } from "@/components/PageShell";

export const metadata = {
  title: "Sign up — Tank Identifier",
  description: "Create a Tank Identifier account.",
};

export default function SignupPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Sign up" },
      ]}
      title="Create account"
      description="Sign up with email and password. We save your profile in Firestore."
    >
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-6 shadow-md sm:p-8">
        <AuthPageGuard>
          <AuthForm mode="signup" />
        </AuthPageGuard>
        <p className="mt-6 text-center text-xs text-subtle">
          <Link href="/" className="text-accent hover:text-accent-hover">
            ← Back to catalog
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
