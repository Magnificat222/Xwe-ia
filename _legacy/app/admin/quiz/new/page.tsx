import Link from "next/link";
import { QuizStageForm } from "@/components/admin/quiz-stage-form";
import { ArrowLeft } from "lucide-react";

export default function NewQuizStagePage() {
  return (
    <div>
      <Link href="/admin/quiz" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-or">
        <ArrowLeft size={15} /> Retour à l'arène de quiz
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Nouvelle étape de quiz</h1>
      <QuizStageForm mode="create" />
    </div>
  );
}
