import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { name } = await request.json();
  const trimmed = typeof name === "string" ? name.trim() : "";

  if (trimmed.length < 2) {
    return NextResponse.json({ error: "Le pseudo doit contenir au moins 2 caractères." }, { status: 400 });
  }
  if (trimmed.length > 40) {
    return NextResponse.json({ error: "Le pseudo est trop long (40 caractères max)." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  return NextResponse.json({ ok: true, name: trimmed });
}
