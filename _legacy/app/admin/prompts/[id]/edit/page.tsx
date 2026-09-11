import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromptForm } from "@/components/admin/prompt-form";
import { ArrowLeft } from "lucide-react";

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [prompt, categories, tools] = await Promise.all([
    prisma.prompt.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tool.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!prompt) notFound();

  return (
    <div>
      <Link href="/admin/prompts" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour aux prompts
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Modifier le prompt</h1>
      <PromptForm
        mode="edit"
        promptId={prompt.id}
        categories={categories}
        tools={tools}
        initial={{
          title: prompt.title,
          content: prompt.content,
          categoryId: prompt.categoryId,
          tags: prompt.tags,
          recommendedTools: prompt.recommendedTools,
          isPremium: prompt.isPremium,
        }}
      />
    </div>
  );
}
