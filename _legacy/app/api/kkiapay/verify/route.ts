import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kkiapayClient } from "@/lib/kkiapay";

// Called by the client right after the Kkiapay widget reports success.
// We NEVER trust the client-side "success" event alone — Kkiapay explicitly
// recommends re-checking the transaction server-side to avoid fraud.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { transactionId, pathSlug } = await request.json();
  if (!transactionId) {
    return NextResponse.json({ error: "transactionId manquant." }, { status: 400 });
  }

  const existingPurchase = await prisma.learningPathPurchase.findUnique({
    where: { transactionId },
  });
  if (existingPurchase?.status === "COMPLETED") {
    return NextResponse.json({ activated: true, type: "PATH" });
  }

  let transaction;
  try {
    transaction = await kkiapayClient.verify(transactionId);
  } catch {
    return NextResponse.json({ error: "Impossible de vérifier la transaction." }, { status: 502 });
  }

  if (transaction.status !== "SUCCESS") {
    return NextResponse.json(
      { error: `Paiement non confirmé (statut: ${transaction.status}).` },
      { status: 400 }
    );
  }

  if (pathSlug) {
    const path = await prisma.learningPath.findUnique({ where: { slug: pathSlug } });
    if (!path || !path.isPublished) {
      return NextResponse.json({ error: "Parcours introuvable." }, { status: 404 });
    }
    if (path.priceXof <= 0) {
      return NextResponse.json({ error: "Ce parcours est gratuit." }, { status: 400 });
    }

    const paidAmount = Number((transaction as { amount?: number }).amount);
    if (Number.isFinite(paidAmount) && paidAmount !== path.priceXof) {
      return NextResponse.json({ error: "Le montant du paiement ne correspond pas au parcours." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.learningPathPurchase.create({
        data: {
          userId: session.user.id,
          learningPathId: path.id,
          amountXof: path.priceXof,
          transactionId,
          status: "COMPLETED",
          purchasedAt: new Date(),
        },
      });
      await tx.learningPathAccess.upsert({
        where: {
          userId_learningPathId: {
            userId: session.user.id,
            learningPathId: path.id,
          },
        },
        update: { status: "ACTIVE", source: "KKIAPAY", priceXof: path.priceXof, transactionId },
        create: {
          userId: session.user.id,
          learningPathId: path.id,
          source: "KKIAPAY",
          priceXof: path.priceXof,
          transactionId,
        },
      });
    });

    return NextResponse.json({ activated: true, type: "PATH", pathSlug });
  }

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: { plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd },
    create: { userId: session.user.id, plan: "PREMIUM", status: "ACTIVE", currentPeriodEnd },
  });

  return NextResponse.json({ activated: true, type: "PREMIUM" });
}
