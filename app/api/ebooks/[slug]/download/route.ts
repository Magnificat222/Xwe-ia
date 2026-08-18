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

  // Ebooks added from the admin panel are stored directly in the database
  // (fileData) so adding one never requires touching the filesystem or
  // redeploying. The one seeded ebook still ships as a file for now.
  if (ebook.fileData) {
    const base64 = ebook.fileData.includes(",") ? ebook.fileData.split(",")[1] : ebook.fileData;
    const buffer = Buffer.from(base64, "base64");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${ebook.slug}.pdf"`,
      },
    });
  }

  if (!ebook.fileName) {
    return NextResponse.json({ error: "Aucun fichier associé à cet ebook." }, { status: 404 });
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
