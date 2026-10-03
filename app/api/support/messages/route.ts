import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { isPremiumActive } from "@/lib/subscription";
import { rateLimit, rateLimitResponse, rlKey } from "@/lib/rate-limit";

// Les images sont stockées en base (base64) : plafond modeste, le client les compresse déjà en JPEG.
const MAX_MESSAGE_LENGTH = 2000;
const MAX_IMAGE_CHARS = 1_500_000;

async function isAllowed(userId: string, role: string) {
  if (role === "ADMIN" || role === "MODERATOR") return true;
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  return isPremiumActive(subscription);
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
    include: { replyTo: { select: { id: true, authorId: true, authorName: true, content: true } } },
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

  // Messages can carry images up to 3 MB stored in the database: cap the pace.
  const limit = await rateLimit({ key: rlKey("support-message", session.user.id), limit: 20, windowSec: 60 });
  if (!limit.allowed) {
    return rateLimitResponse(limit, "Vous envoyez des messages trop vite. Patientez un instant.");
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const { content, imageUrl, replyToId } = body as { content?: unknown; imageUrl?: unknown; replyToId?: unknown };
  const trimmedContent = typeof content === "string" ? content.trim() : "";
  if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message trop long (${MAX_MESSAGE_LENGTH} caractères maximum).` },
      { status: 400 }
    );
  }

  if (!trimmedContent && !imageUrl) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }
  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== "string" || !/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(imageUrl)) {
      return NextResponse.json({ error: "Format d'image invalide." }, { status: 400 });
    }
    if (imageUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: "Image trop volumineuse." }, { status: 400 });
    }
  }

  const senderRole = session.user.role === "ADMIN" ? "ADMIN" : "USER";
  const authorName = session.user.name ?? session.user.email ?? "Membre Xwé IA";

  const message = await prisma.supportMessage.create({
    data: {
      authorId: session.user.id,
      authorName,
      senderRole,
      content: trimmedContent,
      imageUrl: typeof imageUrl === "string" ? imageUrl : null,
      replyToId: typeof replyToId === "string" ? replyToId : null,
    },
  });

  // Notify whoever they replied to (if it's not themselves).
  if (typeof replyToId === "string") {
    const original = await prisma.supportMessage.findUnique({ where: { id: replyToId } });
    if (original?.authorId && original.authorId !== session.user.id) {
      await notify(
        original.authorId,
        "CHAT_REPLY",
        `${authorName} a répondu à votre message dans le Salon Premium.`,
        "/support"
      );
    }
  }

  return NextResponse.json({ message });
}
