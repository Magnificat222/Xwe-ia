import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentNumbers } from "@/db/schema";
import type {
  InitiationResult,
  OrderContext,
  PaymentProvider,
  VerificationResult,
} from "./provider";
import { formatXof } from "@/lib/utils";

/**
 * MTN Mobile Money — encaissement manuel.
 *
 * L'utilisateur envoie l'argent au numéro affiché, puis déclare son paiement.
 * Un administrateur vérifie et confirme. Aucune confirmation automatique :
 * `verify` reste volontairement en attente, car rien côté serveur ne permet
 * encore de prouver la réception des fonds.
 */
export class MoMoManualProvider implements PaymentProvider {
  readonly id = "momo_manual" as const;
  readonly label = "MTN Mobile Money";
  readonly isAutomatic = false;

  async initiate(order: OrderContext): Promise<InitiationResult> {
    const numbers = await db
      .select()
      .from(paymentNumbers)
      .where(and(eq(paymentNumbers.isActive, true)))
      .orderBy(asc(paymentNumbers.position));

    if (numbers.length === 0) {
      return {
        ok: false,
        nextStatus: "awaiting_payment",
        instruction: null,
        error:
          "Aucun numéro de paiement n'est disponible pour le moment. Contacte le support, on règle ça vite.",
      };
    }

    return {
      ok: true,
      nextStatus: "awaiting_payment",
      instruction: {
        numbers: numbers.map((n) => ({
          label: n.label,
          number: n.number,
          holderName: n.holderName,
          isPrimary: n.isPrimary,
        })),
        steps: [
          `Envoie ${formatXof(order.amountXof)} par MTN Mobile Money au numéro indiqué.`,
          `Inscris la référence ${order.reference} dans le motif du transfert.`,
          "Reviens sur cette page et déclare ton paiement avec l'identifiant de la transaction.",
          "Nous vérifions, puis ton parcours s'ouvre automatiquement.",
        ],
        processingDelay: "Vérification sous 24 heures ouvrées, souvent bien plus vite.",
        requiresDeclaration: true,
      },
    };
  }

  /**
   * Un paiement manuel ne peut pas être vérifié par la machine : la décision
   * appartient à l'administration. On renvoie donc `pending` — jamais
   * `confirmed` — pour qu'aucun accès ne puisse s'ouvrir tout seul.
   */
  async verify(_order: OrderContext): Promise<VerificationResult> {
    return { status: "pending" };
  }
}
