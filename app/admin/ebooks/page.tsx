import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, BookOpen } from "lucide-react";
import { DeleteEbookButton } from "@/components/admin/delete-ebook-button";

export default async function AdminEbooksPage() {
  const ebooks = await prisma.ebook.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-ivoire">Ebooks</h1>
        <Link href="/admin/ebooks/new">
          <Button size="sm">
            <Plus size={15} /> Nouvel ebook
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {ebooks.length === 0 && (
          <p className="text-sm text-ivoire-dim">Aucun ebook pour l'instant.</p>
        )}
        {ebooks.map((ebook) => (
          <div key={ebook.id} className="flex items-center justify-between rounded-card border border-ivoire/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-or/10 text-or">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-sm text-ivoire">{ebook.title}</p>
                <p className="text-xs text-ivoire-dim">{ebook.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ebook.isPremium ? <Badge tone="gold">Premium</Badge> : <Badge>Gratuit</Badge>}
              <Link href={`/admin/ebooks/${ebook.id}/edit`} className="text-ivoire-dim hover:text-or">
                <Pencil size={15} />
              </Link>
              <DeleteEbookButton ebookId={ebook.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
