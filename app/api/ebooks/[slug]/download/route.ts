import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const ebook = await prisma.ebook.findUnique({ where: { slug } });
  if (!ebook) {
    return NextResponse.json({ error: "Ebook introuvable." }, { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN";
  if (ebook.isPremium && !isAdmin) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    if (subscription?.plan !== "PREMIUM") {
      return NextResponse.json(
        { error: "Cet ebook est réservé aux membres Premium." },
        { status: 403 }
      );
    }
  }

  // Guard against any path traversal — only a plain filename is ever valid.
  const safeFileName = path.basename(ebook.fileName);
  const filePath = path.join(process.cwd(), "content", "ebooks", safeFileName);

  try {
    const file = await readFile(filePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable sur le serveur." }, { status: 404 });
  }
}
