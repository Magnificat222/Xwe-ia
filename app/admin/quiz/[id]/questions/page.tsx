import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizQuestionsManager } from "@/components/admin/quiz-questions-manager";
import { ArrowLeft } from "lucide-react";

export default async function QuizQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const stage = await prisma.quizStage.findUnique({ where: { id } });
  if (!stage) notFound();

  const questions = await prisma.quizQuestion.findMany({
    where: { stageId: id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <Link href={`/admin/quiz/${id}/edit`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour à l'étape
      </Link>
      <h1 className="mb-1 font-display text-2xl text-ivoire">Questions — {stage.title}</h1>
      <p className="mb-6 text-sm text-ivoire-dim">
        {questions.length} question{questions.length > 1 ? "s" : ""} dans la banque.
        {questions.length > 0 && questions.length < stage.questionCount && (
          <span className="ml-1 text-or">
            Il en faut au moins {stage.questionCount} pour que les parties soient complètes.
          </span>
        )}
      </p>
      <QuizQuestionsManager stageId={id} initialQuestions={questions} />
    </div>
  );
}
