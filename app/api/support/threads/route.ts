import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 403 });
  }

  // Group by user, keep the most recent message per thread.
  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const threadsByUser = new Map<
    string,
    { user: { id: string; name: string | null; email: string }; lastMessage: string; lastAt: Date }
  >();

  for (const m of messages) {
    if (!threadsByUser.has(m.userId)) {
      threadsByUser.set(m.userId, {
        user: m.user,
        lastMessage: m.content,
        lastAt: m.createdAt,
      });
    }
  }

  return NextResponse.json({ threads: Array.from(threadsByUser.values()) });
}
