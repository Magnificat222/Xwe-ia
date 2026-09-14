import "server-only";

import { MoMoManualProvider } from "./momo-manual";
import { MoMoApiProvider } from "./momo-api";
import type { PaymentProvider } from "./provider";

export type { PaymentProvider, PaymentInstruction, OrderContext } from "./provider";

const manual = new MoMoManualProvider();
const api = new MoMoApiProvider();

/**
 * Sélection du fournisseur actif.
 *
 * Un seul point de bascule pour tout le produit : passer à l'API MTN se fait
 * en posant MOMO_API_ENABLED=true, sans toucher au métier. Par défaut, on
 * reste sur l'encaissement manuel, qui est le mode du lancement.
 */
export function getPaymentProvider(): PaymentProvider {
  return process.env.MOMO_API_ENABLED === "true" ? api : manual;
}

/** Retrouve un fournisseur par son identifiant (relecture d'une commande). */
export function getProviderById(id: string): PaymentProvider {
  return id === "momo_api" ? api : manual;
}

/**
 * Référence de commande lisible : XWE-2026-A7K2.
 * Assez courte pour être recopiée dans un message MoMo sans erreur, et sans
 * caractères ambigus (ni O/0 ni I/1).
 */
export function generateOrderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `XWE-${new Date().getFullYear()}-${suffix}`;
}
