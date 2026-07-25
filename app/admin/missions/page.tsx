import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { DeleteMissionButton } from "@/components/dashboard/delete-mission-button";

export default async function AdminMissionsPage() {
  const missions = await prisma.mission.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivoire">Missions</h1>
        <Button size="sm">
          <Plus size={15} /> Nouvelle mission
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-ivoire/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-noir-soft text-ivoire-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Niveau</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {missions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ivoire-dim">
                  Aucune mission pour l'instant — lance `npm run db:seed` pour
                  charger les données de démonstration.
                </td>
              </tr>
            )}
            {missions.map((mission) => (
              <tr key={mission.id} className="border-t border-ivoire/10 text-ivoire">
                <td className="px-4 py-3">{mission.title}</td>
                <td className="px-4 py-3 text-ivoire-dim">{mission.category.name}</td>
                <td className="px-4 py-3 text-ivoire-dim">{mission.level.toLowerCase()}</td>
                <td className="px-4 py-3">
                  {mission.isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button className="text-ivoire-dim hover:text-or"><Pencil size={15} /></button>
                    <DeleteMissionButton missionId={mission.id} />
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
