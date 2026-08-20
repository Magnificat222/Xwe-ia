import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const message = await prisma.supportMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Message introuvable." }, { status: 404 });
  }
  if (message.authorId !== session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez modifier que vos propres messages." }, { status: 403 });
  }

  const { content } = await request.json();
  const trimmed = typeof content === "string" ? content.trim() : "";
  if (!trimmed) {
    return NextResponse.json({ error: "Le message ne peut pas être vide." }, { status: 400 });
  }

  const updated = await prisma.supportMessage.update({
    where: { id },
    data: { content: trimmed, editedAt: new Date() },
  });

  return NextResponse.json({ message: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const message = await prisma.supportMessage.findUnique({ where: { id } });
  if (!message) {
    return NextResponse.json({ error: "Message introuvable." }, { status: 404 });
  }

  // Members can delete their own messages; the admin can moderate anyone's
  // (e.g. content that breaks the community rules).
  const isOwn = message.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwn && !isAdmin) {
    return NextResponse.json({ error: "Vous ne pouvez supprimer que vos propres messages." }, { status: 403 });
  }

  await prisma.supportMessage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
