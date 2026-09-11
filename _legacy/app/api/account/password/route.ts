import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  }

  // Accounts created via OAuth may have no password set yet — in that case
  // there's nothing to verify, we just let them set one.
  if (user.password) {
    if (typeof currentPassword !== "string" || currentPassword.length === 0) {
      return NextResponse.json({ error: "Mot de passe actuel requis." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 403 });
    }
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ ok: true });
}
