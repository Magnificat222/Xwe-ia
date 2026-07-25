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

  const { transactionId } = await request.json();
  if (!transactionId) {
    return NextResponse.json({ error: "transactionId manquant." }, { status: 400 });
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

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: { plan: "PREMIUM", status: "ACTIVE" },
    create: { userId: session.user.id, plan: "PREMIUM", status: "ACTIVE" },
  });

  return NextResponse.json({ activated: true });
}
