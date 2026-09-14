import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { DeletePromptButton } from "@/components/admin/delete-prompt-button";

export default async function AdminPromptsPage() {
  const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: "desc" } });
  const categories = await prisma.category.findMany();
  const categoryName = new Map<string, string>(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivoire">Prompts</h1>
        <Link href="/admin/prompts/new">
          <Button size="sm">
            <Plus size={15} /> Nouveau prompt
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-card border border-ivoire/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-noir-elevated text-ivoire-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {prompts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ivoire-dim">
                  Aucun prompt pour l'instant.
                </td>
              </tr>
            )}
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="border-t border-ivoire/10 text-ivoire">
                <td className="px-4 py-3">{prompt.title}</td>
                <td className="px-4 py-3 text-ivoire-dim">{categoryName.get(prompt.categoryId) ?? "—"}</td>
                <td className="px-4 py-3">
                  {prompt.isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/prompts/${prompt.id}/edit`} className="text-ivoire-dim hover:text-or">
                      <Pencil size={15} />
                    </Link>
                    <DeletePromptButton promptId={prompt.id} />
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
