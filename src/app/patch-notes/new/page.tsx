import { PatchNoteForm } from "@/components/PatchNoteForm";
import { PageShell } from "@/components/PageShell";
import { RequireAdmin } from "@/components/RequireAdmin";

export const metadata = {
  title: "New patch note — Tank Identifier",
};

export default function NewPatchNotePage() {
  return (
    <PageShell
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Patch notes", href: "/patch-notes" },
        { label: "New" },
      ]}
      title="Publish patch note"
      description="Document new tanks and spec changes for this catalog update."
    >
      <RequireAdmin>
        <PatchNoteForm />
      </RequireAdmin>
    </PageShell>
  );
}
