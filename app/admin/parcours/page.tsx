import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { DeletePathButton } from "@/components/admin/delete-path-button";

export default async function AdminParcoursPage() {
  const paths = await prisma.learningPath.findMany({
    include: { missions: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivoire">Parcours</h1>
        <Link href="/admin/parcours/new">
          <Button size="sm">
            <Plus size={15} /> Nouveau parcours
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-ivoire/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-noir-soft text-ivoire-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Missions</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paths.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ivoire-dim">
                  Aucun parcours pour l'instant — créez votre premier parcours ci-dessus.
                </td>
              </tr>
            )}
            {paths.map((path) => (
              <tr key={path.id} className="border-t border-ivoire/10 text-ivoire">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {path.icon && <span>{path.icon}</span>}
                    <span>{path.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ivoire-dim capitalize">
                  {path.category ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {path.isPremium ? (
                    <Badge tone="gold">Premium</Badge>
                  ) : path.priceXof === 0 ? (
                    <Badge>Gratuit</Badge>
                  ) : (
                    <span className="text-or font-mono">
                      {path.priceXof.toLocaleString("fr-FR")} FCFA
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-ivoire-dim">
                  {path.missions.length} mission{path.missions.length > 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3">
                  {path.isPublished ? (
                    <span className="flex items-center gap-1 text-feuillage text-xs">
                      <Eye size={12} /> Publié
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-ivoire-dim text-xs">
                      <EyeOff size={12} /> Brouillon
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/parcours/${path.id}`} className="text-ivoire-dim hover:text-or">
                      <Pencil size={15} />
                    </Link>
                    <DeletePathButton pathId={path.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
