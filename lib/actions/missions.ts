"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { MissionStep } from "@/types";

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
  recommendedTools: string[];
  steps: MissionStep[];
  tips: string[];
  commonMistakes: string[];
  checklist: string[];
  isPremium: boolean;
  isPublished: boolean;
}

export async function createMission(data: MissionFormData) {
  await requireAdmin();

  await prisma.mission.create({
    data: {
      ...data,
      steps: data.steps as unknown as object,
    },
  });

  revalidatePath("/admin/missions");
  revalidatePath("/missions");
  redirect("/admin/missions");
}

export async function updateMission(id: string, data: MissionFormData) {
  await requireAdmin();

  await prisma.mission.update({
    where: { id },
    data: {
      ...data,
      steps: data.steps as unknown as object,
    },
  });

  revalidatePath("/admin/missions");
  revalidatePath("/missions");
  revalidatePath(`/missions/${data.slug}`);
  redirect("/admin/missions");
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
