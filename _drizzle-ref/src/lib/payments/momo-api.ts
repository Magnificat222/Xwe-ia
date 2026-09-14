import "server-only";

import type {
  InitiationResult,
  OrderContext,
  PaymentProvider,
  VerificationResult,
} from "./provider";

/**
 * MTN Mobile Money — API officielle (Collections).
 *
 * Implémentation prête à être activée : elle suit le protocole réel
 * (requestToPay puis interrogation du statut), mais reste inerte tant que les
 * variables d'environnement ne sont pas renseignées. Aucune clé n'est écrite
 * dans le code, et rien de tout ceci n'atteint le navigateur.
 *
 * Pour activer :
 *   MOMO_API_ENABLED=true
 *   MOMO_API_BASE_URL=https://sandbox.momodeveloper.mtn.com
 *   MOMO_SUBSCRIPTION_KEY=…
 *   MOMO_API_USER=…
 *   MOMO_API_KEY=…
 *   MOMO_TARGET_ENVIRONMENT=sandbox
 */
export class MoMoApiProvider implements PaymentProvider {
  readonly id = "momo_api" as const;
  readonly label = "MTN Mobile Money";
  readonly isAutomatic = true;

  private get config() {
    return {
      baseUrl: process.env.MOMO_API_BASE_URL ?? "",
      subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY ?? "",
      apiUser: process.env.MOMO_API_USER ?? "",
      apiKey: process.env.MOMO_API_KEY ?? "",
      environment: process.env.MOMO_TARGET_ENVIRONMENT ?? "sandbox",
      currency: process.env.MOMO_CURRENCY ?? "XOF",
    };
  }

  private isConfigured(): boolean {
    const c = this.config;
    return Boolean(c.baseUrl && c.subscriptionKey && c.apiUser && c.apiKey);
  }

  /** Jeton d'accès OAuth, obtenu à partir des identifiants serveur. */
  private async token(): Promise<string | null> {
    const c = this.config;
    const basic = Buffer.from(`${c.apiUser}:${c.apiKey}`).toString("base64");

    const response = await fetch(`${c.baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Ocp-Apim-Subscription-Key": c.subscriptionKey,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { access_token?: string };
    return data.access_token ?? null;
  }

  async initiate(order: OrderContext): Promise<InitiationResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        nextStatus: "awaiting_payment",
        instruction: null,
        error: "Le paiement automatique n'est pas encore activé.",
      };
    }

    const c = this.config;
    const token = await this.token();
    if (!token) {
      return {
        ok: false,
        nextStatus: "awaiting_payment",
        instruction: null,
        error: "Connexion au service de paiement impossible.",
      };
    }

    const response = await fetch(`${c.baseUrl}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": order.orderId,
        "X-Target-Environment": c.environment,
        "Ocp-Apim-Subscription-Key": c.subscriptionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Le montant vient de la commande, calculée en base : jamais du client.
        amount: String(order.amountXof),
        currency: c.currency,
        externalId: order.reference,
        payer: { partyIdType: "MSISDN", partyId: "" },
        payerMessage: `Xwé IA — ${order.label}`,
        payeeNote: order.reference,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        nextStatus: "awaiting_payment",
        instruction: null,
        error: "La demande de paiement a été refusée par l'opérateur.",
      };
    }

    return {
      ok: true,
      nextStatus: "awaiting_payment",
      providerReference: order.orderId,
      instruction: {
        numbers: [],
        steps: [
          "Valide la demande de paiement reçue sur ton téléphone.",
          "Saisis ton code secret Mobile Money.",
          "L'accès s'ouvre dès que l'opérateur confirme.",
        ],
        processingDelay: "Confirmation en quelques secondes.",
        requiresDeclaration: false,
      },
    };
  }

  /** Seule source de vérité : la réponse de l'opérateur, côté serveur. */
  async verify(order: OrderContext): Promise<VerificationResult> {
    if (!this.isConfigured()) return { status: "pending" };

    const c = this.config;
    const token = await this.token();
    if (!token) return { status: "pending", error: "Service indisponible." };

    const response = await fetch(
      `${c.baseUrl}/collection/v1_0/requesttopay/${order.orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": c.environment,
          "Ocp-Apim-Subscription-Key": c.subscriptionKey,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return { status: "pending" };

    const data = (await response.json()) as {
      status?: string;
      financialTransactionId?: string;
      amount?: string;
    };

    if (data.status === "SUCCESSFUL") {
      const paid = Number(data.amount ?? 0);
      // Un montant inférieur au dû ne confirme rien : on laisse l'humain trancher.
      if (paid > 0 && paid < order.amountXof) {
        return { status: "pending", error: "Montant insuffisant." };
      }
      return {
        status: "confirmed",
        transactionId: data.financialTransactionId,
        amountXof: paid || order.amountXof,
      };
    }

    if (data.status === "FAILED") return { status: "failed" };
    return { status: "pending" };
  }
}
