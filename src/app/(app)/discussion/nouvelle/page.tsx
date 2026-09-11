import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { NewDiscussionForm } from "@/components/app/discussion-forms";
import { requireUser } from "@/lib/auth/guards";
import { getCategories } from "@/lib/queries/catalogue";

export const metadata: Metadata = { title: "Nouveau sujet" };

export default async function NewDiscussionPage() {
  await requireUser("/discussion/nouvelle");
  const categories = await getCategories();

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[{ label: "Discussion", href: "/discussion" }, { label: "Nouveau sujet" }]}
      />
      <div>
        <h1 className="font-display text-2xl text-ivoire">Ouvrir une discussion</h1>
        <p className="mt-2 text-sm text-ivoire-dim">
          Sois précis : plus ta question est claire, plus les réponses seront utiles.
        </p>
      </div>
      <NewDiscussionForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </PageTransition>
  );
}
