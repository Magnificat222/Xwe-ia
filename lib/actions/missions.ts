"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }
  return session;
}

export interface MissionFormData {
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  level: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE";
  estimatedMinutes: number;
  isPremium: boolean;
  isPublished: boolean;
}

export async function createMission(data: MissionFormData) {
  await requireAdmin();

  await prisma.mission.create({
    data: {
      ...data,
      recommendedTools: [],
      steps: [],
      tips: [],
      commonMistakes: [],
      checklist: [],
    },
  });

  revalidatePath("/admin/missions");
  revalidatePath("/missions");
}

export async function updateMission(id: string, data: Partial<MissionFormData>) {
  await requireAdmin();

  await prisma.mission.update({ where: { id }, data });

  revalidatePath("/admin/missions");
  revalidatePath("/missions");
}

export async function deleteMission(id: string) {
  await requireAdmin();

  await prisma.mission.delete({ where: { id } });

  revalidatePath("/admin/missions");
  revalidatePath("/missions");
}

export async function togglePublish(id: string, isPublished: boolean) {
  await requireAdmin();

  await prisma.mission.update({ where: { id }, data: { isPublished } });

  revalidatePath("/admin/missions");
}
