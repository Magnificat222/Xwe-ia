import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wizards } from "@/lib/wizards";
import { PathForm } from "@/components/admin/path-form";

export default async function NewPathPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/support");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <Link href="/admin/parcours" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour aux parcours
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Nouveau parcours</h1>
      <PathForm
        categories={categories}
        wizardTypes={Object.values(wizards).map((w) => ({ type: w.type, title: w.title }))}
        initial={{
          slug: "", title: "", description: "", accessType: "FREE", creditCost: 0, isPublished: false,
          difficulty: "DEBUTANT", estimatedMinutes: null, resultSummary: "", deliverableType: "",
          wizardType: "", categoryId: null, displayOrder: 0,
        }}
      />
    </div>
  );
}
