import "server-only";

import type { AiFeature } from "@/db/schema";

/**
 * Contrat de fournisseur d'IA.
 *
 * Les clés vivent exclusivement dans les variables d'environnement du serveur.
 * Aucun composant client n'importe ce module, et aucune réponse ne renvoie de
 * secret. Changer de modèle ou de prestataire n'affecte pas les missions.
 */

export interface AiMessage {
  role: "system" | "user";
  content: string;
}

export interface AiRequest {
  feature: AiFeature;
  messages: AiMessage[];
  /** Plafond de longueur, pour maîtriser la dépense. */
  maxOutputTokens?: number;
  temperature?: number;
}

export interface AiResponse {
  ok: boolean;
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  /** Vrai lorsque la réponse vient du moteur local, sans modèle distant. */
  offline: boolean;
  error?: string;
}

export interface AiProvider {
  readonly id: string;
  readonly label: string;
  readonly isConfigured: boolean;
  complete(request: AiRequest): Promise<AiResponse>;
}

/** Estimation suffisante pour la facturation interne et les quotas. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
