import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MissionForm } from "@/components/admin/mission-form";
import { ArrowLeft } from "lucide-react";

export default async function NewMissionPage() {
  const [categories, tools] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tool.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Link href="/admin/missions" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour aux missions
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Nouvelle mission</h1>
      <MissionForm mode="create" categories={categories} tools={tools} />
    </div>
  );
}
