import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { verifyAndGrantKkiapayPremium } from "@/lib/kkiapay-premium";
import { enforceRateLimit, rlKey } from "@/lib/rate-limit";
import { ServiceError, toErrorResponse } from "@/lib/services/errors";
import { KKIAPAY_COMING_SOON } from "@/lib/constants";

// Called by the client right after the Kkiapay widget reports success.
// The browser's "success" event is NEVER proof of payment: only the
// transactionId is used, and the server re-verifies everything with Kkiapay
// (status, amount, owner) and records the transaction so it can be used once.
// See lib/kkiapay-premium.ts.
export async function POST(request: Request) {
  // Blocage dur : Kkiapay n'est pas encore ouvert (voir lib/constants.ts).
  if (KKIAPAY_COMING_SOON) {
    return NextResponse.json(
      { error: "Le paiement Kkiapay sera bientôt disponible.", code: "COMING_SOON" },
      { status: 503 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    // Quand le paiement en ligne est désactivé (Admin → Réglages), cette route
    // ne doit plus pouvoir activer Premium : le masquage du bouton côté
    // interface ne suffit pas, l'API reste appelable directement.
    const settings = await getSiteSettings();
    if (!settings.selfServePremiumEnabled) {
      return NextResponse.json({ error: "Le paiement en ligne est désactivé." }, { status: 403 });
    }

    // Each call may hit the Kkiapay API: cap it per user.
    await enforceRateLimit({ key: rlKey("kkiapay-verify", session.user.id), limit: 10, windowSec: 600 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || !("transactionId" in body)) {
      throw new ServiceError("INVALID_TRANSACTION", "transactionId manquant.", 400);
    }

    const result = await verifyAndGrantKkiapayPremium(session.user.id, (body as { transactionId: unknown }).transactionId);
    return NextResponse.json({ activated: result.activated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
