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

export interface PromptFormData {
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  recommendedTools: string[];
  isPremium: boolean;
}

export async function createPrompt(data: PromptFormData) {
  await requireAdmin();
  await prisma.prompt.create({ data });
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
  redirect("/admin/prompts");
}

export async function updatePrompt(id: string, data: PromptFormData) {
  await requireAdmin();
  await prisma.prompt.update({ where: { id }, data });
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
  redirect("/admin/prompts");
}

export async function deletePrompt(id: string) {
  await requireAdmin();
  await prisma.prompt.delete({ where: { id } });
  revalidatePath("/admin/prompts");
  revalidatePath("/prompts");
}
