import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { imageUrl } = await request.json();

  if (imageUrl !== null) {
    if (typeof imageUrl !== "string" || !imageUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Format d'image invalide." }, { status: 400 });
    }
    if (imageUrl.length > 1_500_000) {
      return NextResponse.json({ error: "Image trop volumineuse." }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: imageUrl },
  });

  return NextResponse.json({ ok: true });
}
