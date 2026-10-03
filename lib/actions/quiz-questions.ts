"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/guards";

// Role re-read from the database (the JWT role can be stale after a demotion).
async function requireAdmin() {
  await requireAdminId();
}

export interface QuizQuestionFormData {
  question: string;
  options: string[]; // exactly 4
  correctIndex: number;
  explanation: string;
}

export async function createQuizQuestion(stageId: string, data: QuizQuestionFormData) {
  await requireAdmin();
  await prisma.quizQuestion.create({ data: { stageId, ...data } });
  revalidatePath(`/admin/quiz/${stageId}/questions`);
}

export async function updateQuizQuestion(id: string, stageId: string, data: QuizQuestionFormData) {
  await requireAdmin();
  await prisma.quizQuestion.update({ where: { id }, data });
  revalidatePath(`/admin/quiz/${stageId}/questions`);
}

export async function deleteQuizQuestion(id: string, stageId: string) {
  await requireAdmin();
  await prisma.quizQuestion.delete({ where: { id } });
  revalidatePath(`/admin/quiz/${stageId}/questions`);
}
