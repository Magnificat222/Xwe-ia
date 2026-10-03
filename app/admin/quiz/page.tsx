import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { DeleteQuizStageButton } from "@/components/admin/delete-quiz-stage-button";

export default async function AdminQuizPage() {
  const stages = await prisma.quizStage.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivoire">Arène de quiz</h1>
        <Link href="/admin/quiz/new">
          <Button size="sm">
            <Plus size={15} /> Nouvelle étape
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-ivoire/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-noir-elevated text-ivoire-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Ordre</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Niveau</th>
              <th className="px-4 py-3 font-medium">Questions</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {stages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ivoire-dim">Aucune étape pour l'instant.</td>
              </tr>
            )}
            {stages.map((stage) => (
              <tr key={stage.id} className="border-t border-ivoire/10 text-ivoire">
                <td className="px-4 py-3 text-ivoire-dim">{stage.order}</td>
                <td className="px-4 py-3">{stage.title}</td>
                <td className="px-4 py-3 text-ivoire-dim">{stage.level.toLowerCase()}</td>
                <td className="px-4 py-3 text-ivoire-dim">{stage.questionCount}</td>
                <td className="px-4 py-3">
                  {stage.isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/quiz/${stage.id}/edit`} className="text-ivoire-dim hover:text-or">
                      <Pencil size={15} />
                    </Link>
                    <DeleteQuizStageButton stageId={stage.id} />
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
