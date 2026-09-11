import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EbookForm } from "@/components/admin/ebook-form";
import { ArrowLeft } from "lucide-react";

export default async function EditEbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ebook = await prisma.ebook.findUnique({ where: { id } });
  if (!ebook) notFound();

  return (
    <div>
      <Link href="/admin/ebooks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour aux ebooks
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Modifier l'ebook</h1>
      <EbookForm
        mode="edit"
        ebookId={ebook.id}
        initial={{
          title: ebook.title,
          description: ebook.description,
          isPremium: ebook.isPremium,
          hasExistingFile: Boolean(ebook.fileData || ebook.fileName),
        }}
      />
    </div>
  );
}
