import "server-only";

/**
 * Contrat de fournisseur de paiement.
 *
 * Le métier de Xwé IA (commande, accès, progression) ne connaît que cette
 * interface. Passer du MoMo manuel à l'API MTN, ou ajouter un agrégateur,
 * revient à écrire une nouvelle implémentation — sans toucher aux actions
 * ni aux pages.
 */

export interface PaymentInstruction {
  /** Ce que l'utilisateur doit faire, en clair. */
  steps: string[];
  /** Numéros vers lesquels envoyer l'argent (MoMo manuel). */
  numbers: { label: string; number: string; holderName: string | null; isPrimary: boolean }[];
  /** Délai annoncé avant traitement. */
  processingDelay: string;
  /** Vrai si l'utilisateur doit déclarer son paiement lui-même. */
  requiresDeclaration: boolean;
}

export interface InitiationResult {
  ok: boolean;
  /** Statut dans lequel placer la commande après initiation. */
  nextStatus: "awaiting_payment" | "declared" | "confirmed";
  instruction: PaymentInstruction | null;
  /** Identifiant côté prestataire, quand il existe. */
  providerReference?: string;
  error?: string;
}

export interface VerificationResult {
  /** `pending` = pas encore tranché, on n'ouvre rien. */
  status: "pending" | "confirmed" | "failed";
  transactionId?: string;
  amountXof?: number;
  error?: string;
}

export interface OrderContext {
  orderId: string;
  reference: string;
  amountXof: number;
  userId: string;
  label: string;
}

export interface PaymentProvider {
  readonly id: "momo_manual" | "momo_api";
  readonly label: string;
  /** Vrai si le prestataire tranche lui-même, sans intervention humaine. */
  readonly isAutomatic: boolean;

  /** Prépare le paiement : instructions à afficher, ou appel au prestataire. */
  initiate(order: OrderContext): Promise<InitiationResult>;

  /**
   * Vérifie l'état réel du paiement, côté serveur uniquement.
   * Le manuel renvoie toujours `pending` : seul un humain tranche.
   */
  verify(order: OrderContext): Promise<VerificationResult>;
}
