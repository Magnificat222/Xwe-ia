import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAIReply } from "@/lib/gemini";

async function isAllowed(userId: string, role: string) {
  if (role === "ADMIN") return true;
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  return subscription?.plan === "PREMIUM";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const allowed = await isAllowed(session.user.id, session.user.role);
  if (!allowed) {
    return NextResponse.json({ error: "Réservé aux membres Premium." }, { status: 403 });
  }

  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { replyTo: { select: { id: true, authorName: true, content: true } } },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const allowed = await isAllowed(session.user.id, session.user.role);
  if (!allowed) {
    return NextResponse.json({ error: "Réservé aux membres Premium." }, { status: 403 });
  }

  const { content, imageUrl, replyToId } = await request.json();
  const trimmedContent = typeof content === "string" ? content.trim() : "";

  if (!trimmedContent && !imageUrl) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }
  if (typeof imageUrl === "string" && imageUrl.length > 3_000_000) {
    return NextResponse.json({ error: "Image trop volumineuse." }, { status: 400 });
  }
  if (typeof imageUrl === "string" && !imageUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Format d'image invalide." }, { status: 400 });
  }

  const senderRole = session.user.role === "ADMIN" ? "ADMIN" : "USER";
  const authorName = session.user.name ?? session.user.email ?? "Membre Xwé IA";

  const message = await prisma.supportMessage.create({
    data: {
      authorId: session.user.id,
      authorName,
      senderRole,
      content: trimmedContent,
      imageUrl: imageUrl ?? null,
      replyToId: typeof replyToId === "string" ? replyToId : null,
    },
  });

  // Only auto-reply to regular members with actual text, not to the admin's
  // own messages, and not to image-only posts (Gemini here is text-only —
  // replying to a picture it can't see would just be a confusing guess).
  if (senderRole === "USER" && trimmedContent) {
    const aiText = await generateAIReply(trimmedContent);
    if (aiText) {
      await prisma.supportMessage.create({
        data: {
          authorId: null,
          authorName: "Assistant IA",
          senderRole: "AI",
          content: aiText,
        },
      });
    }
  }

  return NextResponse.json({ message });
}
