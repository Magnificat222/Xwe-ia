import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  let targetUserId = session.user.id;

  if (session.user.role === "ADMIN" && requestedUserId) {
    targetUserId = requestedUserId;
  }

  const messages = await prisma.supportMessage.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { content, userId } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  // Admin replying into someone else's thread
  if (session.user.role === "ADMIN" && userId) {
    const message = await prisma.supportMessage.create({
      data: { userId, senderRole: "ADMIN", content },
    });
    return NextResponse.json({ message });
  }

  // Regular user writing in their own thread — must be Premium.
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (subscription?.plan !== "PREMIUM") {
    return NextResponse.json(
      { error: "Le chat support est réservé aux membres Premium." },
      { status: 403 }
    );
  }

  const message = await prisma.supportMessage.create({
    data: { userId: session.user.id, senderRole: "USER", content },
  });

  return NextResponse.json({ message });
}
