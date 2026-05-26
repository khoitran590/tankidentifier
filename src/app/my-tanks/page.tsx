import Link from "next/link";
import { MyTanksList } from "@/components/MyTanksList";
import { PageShell } from "@/components/PageShell";

export const metadata = {
  title: "My tanks — Tank Identifier",
  description: "Your custom tanks with specifications, stored in Firestore.",
};

export default function MyTanksPage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "My tanks" },
      ]}
      title="My tanks"
      description="Tanks you added with photos and full specifications. Only visible to your account."
      actions={
        <Link
          href="/my-tanks/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover dark:text-stone-950"
        >
          + Add tank
        </Link>
      }
    >
      <MyTanksList />
    </PageShell>
  );
}
