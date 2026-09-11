import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

/** Téléchargement d'un livrable. Un utilisateur ne peut lire que les siens. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Non authentifié", { status: 401 });

  const { id } = await params;
  const rows = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.id)))
    .limit(1);

  const doc = rows[0];
  if (!doc) return new NextResponse("Introuvable", { status: 404 });

  if (doc.fileUrl && !doc.body) return NextResponse.redirect(doc.fileUrl);

  const filename = `${doc.title.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.md`;

  return new NextResponse(doc.body ?? "", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
