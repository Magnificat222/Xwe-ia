import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizStageForm } from "@/components/admin/quiz-stage-form";
import { ArrowLeft } from "lucide-react";

export default async function EditQuizStagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stage = await prisma.quizStage.findUnique({ where: { id } });
  if (!stage) notFound();

  return (
    <div>
      <Link href="/admin/quiz" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour à l'arène de quiz
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Modifier l'étape</h1>
      <QuizStageForm
        mode="edit"
        stageId={stage.id}
        initial={{
          title: stage.title,
          description: stage.description,
          topic: stage.topic,
          level: stage.level,
          questionCount: stage.questionCount,
          order: stage.order,
          isPremium: stage.isPremium,
        }}
      />
    </div>
  );
}
