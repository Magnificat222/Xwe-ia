"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { missions } from "@/db/schema";
import type { AiFeature } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { resolveAccess } from "@/lib/access";
import { ask } from "@/lib/ai";

/**
 * Assistance IA.
 *
 * La clé ne quitte jamais le serveur : le client n'envoie qu'un texte et une
 * intention, et reçoit du texte. Chaque appel est compté et plafonné.
 */

const ALLOWED_FEATURES: AiFeature[] = [
  "mission_assist",
  "brainstorm",
  "rephrase",
  "structure",
  "analyze",
  "explain",
];

export interface AssistResult {
  ok: boolean;
  text: string;
  offline: boolean;
  error?: string;
  usedToday?: number;
  dailyLimit?: number;
}

/**
 * Demande d'assistance depuis une mission.
 *
 * L'accès au parcours est revérifié ici : sans quoi l'assistance deviendrait
 * une porte dérobée vers le contenu payant.
 */
export async function assistAction(
  feature: string,
  prompt: string,
  missionSlug?: string,
): Promise<AssistResult> {
  const session = await requireUser("/tableau-de-bord");

  if (!ALLOWED_FEATURES.includes(feature as AiFeature)) {
    return { ok: false, text: "", offline: false, error: "Demande non reconnue." };
  }

  const trimmed = prompt.trim();
  if (trimmed.length < 3) {
    return { ok: false, text: "", offline: false, error: "Écris ta demande avant de l'envoyer." };
  }
  // Plafond d'entrée : protège la dépense autant que le temps de réponse.
  if (trimmed.length > 6000) {
    return {
      ok: false,
      text: "",
      offline: false,
      error: "Ton texte est trop long. Envoie-le par parties.",
    };
  }

  let context: string | undefined;
  let missionId: string | undefined;

  if (missionSlug) {
    const rows = await db
      .select({
        id: missions.id,
        title: missions.title,
        objective: missions.objective,
        pathwayId: missions.pathwayId,
      })
      .from(missions)
      .where(eq(missions.slug, missionSlug))
      .limit(1);

    const mission = rows[0];
    if (mission) {
      const { pathways } = await import("@/db/schema");
      const pathwayRows = await db
        .select({
          id: pathways.id,
          accessType: pathways.accessType,
          priceXof: pathways.priceXof,
        })
        .from(pathways)
        .where(eq(pathways.id, mission.pathwayId))
        .limit(1);

      const pathway = pathwayRows[0];
      if (pathway) {
        const access = await resolveAccess(session, {
          id: pathway.id,
          accessType: pathway.accessType,
          priceXof: pathway.priceXof,
        });
        if (!access.allowed) {
          return {
            ok: false,
            text: "",
            offline: false,
            error: "Cette mission n'est pas ouverte pour toi.",
          };
        }
      }

      missionId = mission.id;
      context = `Mission « ${mission.title} ». Objectif : ${mission.objective}`;
    }
  }

  const result = await ask({
    userId: session.id,
    plan: session.plan,
    feature: feature as AiFeature,
    prompt: trimmed,
    context,
    missionId,
  });

  return {
    ok: result.ok,
    text: result.text,
    offline: result.offline,
    error: result.error,
    usedToday: result.quota?.usedToday,
    dailyLimit: result.quota?.dailyLimit,
  };
}
