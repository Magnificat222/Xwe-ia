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

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const senderRole = session.user.role === "ADMIN" ? "ADMIN" : "USER";
  const authorName = session.user.name ?? session.user.email ?? "Membre Xwé IA";

  const message = await prisma.supportMessage.create({
    data: { authorId: session.user.id, authorName, senderRole, content },
  });

  // Only auto-reply to regular members, not to the admin's own messages,
  // so Gemini doesn't talk over her when she's actively answering.
  if (senderRole === "USER") {
    const aiText = await generateAIReply(content);
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
