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

export interface EbookFormData {
  title: string;
  description: string;
  isPremium: boolean;
  fileData?: string; // base64 data URL, only present when a new file was picked
}

export async function createEbook(data: EbookFormData) {
  await requireAdmin();

  if (!data.fileData) {
    throw new Error("Un fichier PDF est requis.");
  }

  await prisma.ebook.create({
    data: {
      slug: `${slugify(data.title)}-${Date.now().toString(36)}`,
      title: data.title,
      description: data.description,
      isPremium: data.isPremium,
      fileData: data.fileData,
    },
  });

  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
  redirect("/admin/ebooks");
}

export async function updateEbook(id: string, data: EbookFormData) {
  await requireAdmin();

  await prisma.ebook.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      isPremium: data.isPremium,
      ...(data.fileData ? { fileData: data.fileData, fileName: null } : {}),
    },
  });

  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
  redirect("/admin/ebooks");
}

export async function deleteEbook(id: string) {
  await requireAdmin();
  await prisma.ebook.delete({ where: { id } });
  revalidatePath("/admin/ebooks");
  revalidatePath("/ebooks");
}
