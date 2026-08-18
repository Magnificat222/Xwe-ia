"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }
  return session;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface QuizStageFormData {
  title: string;
  description: string;
  topic: string;
  level: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  questionCount: number;
  order: number;
  isPremium: boolean;
}

export async function createQuizStage(data: QuizStageFormData) {
  await requireAdmin();

  await prisma.quizStage.create({
    data: { ...data, slug: `${slugify(data.title)}-${Date.now().toString(36)}` },
  });

  revalidatePath("/admin/quiz");
  revalidatePath("/quiz");
  redirect("/admin/quiz");
}

export async function updateQuizStage(id: string, data: QuizStageFormData) {
  await requireAdmin();
  await prisma.quizStage.update({ where: { id }, data });
  revalidatePath("/admin/quiz");
  revalidatePath("/quiz");
  redirect("/admin/quiz");
}

export async function deleteQuizStage(id: string) {
  await requireAdmin();
  await prisma.quizStage.delete({ where: { id } });
  revalidatePath("/admin/quiz");
  revalidatePath("/quiz");
}
