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

export interface LearningPathFormData {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  category?: string;
  targetAudience: string[];
  difficulty: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  estimatedHours?: number;
  resultTitle?: string;
  resultDescription?: string;
  priceXof: number;
  isPremium: boolean;
  isPublished: boolean;
  // IDs des missions dans l'ordre
  missionIds: string[];
}

export async function createLearningPath(data: LearningPathFormData) {
  await requireAdmin();

  const { missionIds, ...pathData } = data;

  const path = await prisma.learningPath.create({
    data: {
      ...pathData,
      estimatedHours: pathData.estimatedHours ?? null,
      icon: pathData.icon ?? null,
      category: pathData.category ?? null,
      resultTitle: pathData.resultTitle ?? null,
      resultDescription: pathData.resultDescription ?? null,
    },
  });

  // Créer les associations avec les missions dans l'ordre donné
  if (missionIds.length > 0) {
    await prisma.learningPathMission.createMany({
      data: missionIds.map((missionId, index) => ({
        learningPathId: path.id,
        missionId,
        order: index + 1,
      })),
    });
  }

  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
  redirect("/admin/parcours");
}

export async function updateLearningPath(id: string, data: LearningPathFormData) {
  await requireAdmin();

  const { missionIds, ...pathData } = data;

  await prisma.learningPath.update({
    where: { id },
    data: {
      ...pathData,
      estimatedHours: pathData.estimatedHours ?? null,
      icon: pathData.icon ?? null,
      category: pathData.category ?? null,
      resultTitle: pathData.resultTitle ?? null,
      resultDescription: pathData.resultDescription ?? null,
    },
  });

  // Reconstruire entièrement les associations (supprimer puis recréer dans l'ordre)
  await prisma.learningPathMission.deleteMany({ where: { learningPathId: id } });

  if (missionIds.length > 0) {
    await prisma.learningPathMission.createMany({
      data: missionIds.map((missionId, index) => ({
        learningPathId: id,
        missionId,
        order: index + 1,
      })),
    });
  }

  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
  revalidatePath(`/parcours/${pathData.slug}`);
  redirect("/admin/parcours");
}

export async function deleteLearningPath(id: string) {
  await requireAdmin();

  await prisma.learningPath.delete({ where: { id } });

  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

export async function togglePathPublish(id: string, isPublished: boolean) {
  await requireAdmin();

  await prisma.learningPath.update({ where: { id }, data: { isPublished } });

  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}
