"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }
  if (session.user.id === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte administrateur.");
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
}
