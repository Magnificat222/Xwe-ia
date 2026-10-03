import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default async function AdminPathsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/support");

  const paths = await prisma.learningPath.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { missions: true, accesses: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivoire">Parcours</h1>
        <Link href="/admin/parcours/new">
          <Button size="sm"><Plus size={15} /> Nouveau parcours</Button>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-card border border-ivoire/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-noir-soft text-ivoire-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Accès</th>
              <th className="px-4 py-3 font-medium">Missions</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paths.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ivoire-dim">Aucun parcours.</td></tr>
            )}
            {paths.map((p) => (
              <tr key={p.id} className="border-t border-ivoire/10 text-ivoire">
                <td className="px-4 py-3">{p.title}{p.wizardType && <span className="ml-2 font-mono text-xs text-or">{p.wizardType}</span>}</td>
                <td className="px-4 py-3">
                  {p.accessType === "FREE" && <Badge>Gratuit</Badge>}
                  {p.accessType === "PREMIUM" && <Badge tone="gold">Premium</Badge>}
                  {p.accessType === "CREDITS" && <Badge tone="gold">{p.creditCost} crédits</Badge>}
                </td>
                <td className="px-4 py-3 text-ivoire-dim">{p._count.missions}</td>
                <td className="px-4 py-3">{p.isPublished ? <Badge tone="feuillage">Publié</Badge> : <Badge>Brouillon</Badge>}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/parcours/${p.id}`} className="inline-flex items-center gap-1 text-ivoire-dim hover:text-or"><Pencil size={14} /> Modifier</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
