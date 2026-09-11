import "server-only";

import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { aiQuotas, aiUsage } from "@/db/schema";
import type { AiFeature } from "@/db/schema";
import { GeminiProvider } from "./gemini";
import { OfflineAiProvider } from "./offline";
import type { AiProvider, AiRequest, AiResponse } from "./provider";

export type { AiProvider, AiRequest, AiResponse } from "./provider";

const gemini = new GeminiProvider();
const offline = new OfflineAiProvider();

/**
 * Fournisseur actif. Si aucune clé n'est configurée, on bascule sur
 * l'assistant local plutôt que d'afficher une erreur : la mission reste
 * utilisable, ce qui compte davantage que la présence d'un modèle distant.
 */
export function getAiProvider(): AiProvider {
  return gemini.isConfigured ? gemini : offline;
}

/* ------------------------------------------------------------------ *
 * Quotas
 * ------------------------------------------------------------------ */

/** Valeurs de repli si l'administration n'a rien défini pour ce couple. */
const DEFAULT_QUOTAS: Record<"free" | "premium", { daily: number; monthly: number }> = {
  free: { daily: 15, monthly: 150 },
  premium: { daily: 120, monthly: 2000 },
};

export interface QuotaState {
  allowed: boolean;
  usedToday: number;
  dailyLimit: number;
  usedThisMonth: number;
  monthlyLimit: number;
  reason?: string;
}

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Vérifie le quota d'un utilisateur pour une fonctionnalité.
 * Les limites sont administrables ; le code ne fournit qu'un repli.
 */
export async function checkQuota(
  userId: string,
  plan: "free" | "premium",
  feature: AiFeature,
): Promise<QuotaState> {
  const configured = await db
    .select()
    .from(aiQuotas)
    .where(and(eq(aiQuotas.plan, plan), eq(aiQuotas.feature, feature)))
    .limit(1);

  const quota = configured[0];
  if (quota && !quota.isEnabled) {
    return {
      allowed: false,
      usedToday: 0,
      dailyLimit: 0,
      usedThisMonth: 0,
      monthlyLimit: 0,
      reason: "Cette assistance n'est pas disponible avec ton offre.",
    };
  }

  const dailyLimit = quota?.dailyLimit ?? DEFAULT_QUOTAS[plan].daily;
  const monthlyLimit = quota?.monthlyLimit ?? DEFAULT_QUOTAS[plan].monthly;

  const [daily] = await db
    .select({ n: count() })
    .from(aiUsage)
    .where(
      and(eq(aiUsage.userId, userId), eq(aiUsage.ok, true), gte(aiUsage.createdAt, startOfDay())),
    );

  const [monthly] = await db
    .select({ n: count() })
    .from(aiUsage)
    .where(
      and(eq(aiUsage.userId, userId), eq(aiUsage.ok, true), gte(aiUsage.createdAt, startOfMonth())),
    );

  const usedToday = daily?.n ?? 0;
  const usedThisMonth = monthly?.n ?? 0;

  if (usedToday >= dailyLimit) {
    return {
      allowed: false,
      usedToday,
      dailyLimit,
      usedThisMonth,
      monthlyLimit,
      reason:
        plan === "free"
          ? "Tu as atteint ta limite d'assistance pour aujourd'hui. Elle repart demain, ou passe en Premium."
          : "Limite quotidienne atteinte. Elle repart demain.",
    };
  }

  if (usedThisMonth >= monthlyLimit) {
    return {
      allowed: false,
      usedToday,
      dailyLimit,
      usedThisMonth,
      monthlyLimit,
      reason: "Limite mensuelle atteinte.",
    };
  }

  return { allowed: true, usedToday, dailyLimit, usedThisMonth, monthlyLimit };
}

/* ------------------------------------------------------------------ *
 * Garde-fou anti-abus
 * ------------------------------------------------------------------ */

const recent = new Map<string, number[]>();
const BURST_WINDOW_MS = 60_000;
const BURST_MAX = 8;

/** Limite les rafales, en complément des quotas journaliers. */
function rateLimit(userId: string): boolean {
  const now = Date.now();
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < BURST_WINDOW_MS);
  hits.push(now);
  recent.set(userId, hits);

  // Purge occasionnelle pour éviter que la table ne grossisse indéfiniment.
  if (recent.size > 500) {
    for (const [key, times] of recent) {
      if (times.every((t) => now - t > BURST_WINDOW_MS)) recent.delete(key);
    }
  }

  return hits.length <= BURST_MAX;
}

/* ------------------------------------------------------------------ *
 * Point d'entrée unique
 * ------------------------------------------------------------------ */

export interface AskOptions {
  userId: string;
  plan: "free" | "premium";
  feature: AiFeature;
  prompt: string;
  context?: string;
  missionId?: string;
}

export interface AskResult {
  ok: boolean;
  text: string;
  offline: boolean;
  error?: string;
  quota?: { usedToday: number; dailyLimit: number };
}

const SYSTEM_PROMPT = [
  "Tu es l'assistant de Xwé IA, une plateforme francophone qui aide à transformer une idée en résultat concret.",
  "Tu écris en français, avec des phrases courtes et un ton direct, jamais condescendant.",
  "Tu aides à structurer, reformuler, questionner et clarifier.",
  "Règle absolue : tu n'inventes jamais de chiffre, de prix, de donnée de marché ou de fait vérifiable.",
  "Si une information de ce type manque, tu demandes à l'utilisateur de la fournir, ou tu l'annonces explicitement comme une estimation à vérifier.",
  "Tu ne rédiges pas le travail à la place de la personne : tu l'aides à le produire elle-même.",
].join(" ");

/**
 * Appelle l'IA pour un utilisateur donné.
 *
 * Enchaîne : garde anti-rafale → quota → appel → journalisation. Toute la
 * consommation est enregistrée, ce qui rend les statistiques et les limites
 * réellement applicables.
 */
export async function ask(options: AskOptions): Promise<AskResult> {
  if (!rateLimit(options.userId)) {
    return {
      ok: false,
      text: "",
      offline: false,
      error: "Trop de demandes d'affilée. Laisse passer une minute.",
    };
  }

  const quota = await checkQuota(options.userId, options.plan, options.feature);
  if (!quota.allowed) {
    return { ok: false, text: "", offline: false, error: quota.reason };
  }

  const provider = getAiProvider();
  const started = Date.now();

  const request: AiRequest = {
    feature: options.feature,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: options.context
          ? `Contexte de la mission :\n${options.context}\n\n---\n\n${options.prompt}`
          : options.prompt,
      },
    ],
  };

  let response: AiResponse = await provider.complete(request);

  // Si le service distant échoue, on ne laisse pas l'utilisateur sans réponse :
  // l'assistant local prend le relais et on le dit honnêtement.
  if (!response.ok && provider.id !== "offline") {
    response = await offline.complete(request);
  }

  await db.insert(aiUsage).values({
    userId: options.userId,
    feature: options.feature,
    provider: response.offline ? "offline" : provider.id,
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    latencyMs: Date.now() - started,
    missionId: options.missionId ?? null,
    ok: response.ok,
    errorCode: response.error?.slice(0, 60) ?? null,
  });

  return {
    ok: response.ok,
    text: response.text,
    offline: response.offline,
    error: response.error,
    quota: { usedToday: quota.usedToday + 1, dailyLimit: quota.dailyLimit },
  };
}

/** Consommation d'un utilisateur, pour l'affichage dans les paramètres. */
export async function getUserAiUsage(userId: string) {
  const [today] = await db
    .select({ n: count() })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), gte(aiUsage.createdAt, startOfDay())));

  const [month] = await db
    .select({ n: count() })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), gte(aiUsage.createdAt, startOfMonth())));

  return { today: today?.n ?? 0, month: month?.n ?? 0 };
}
