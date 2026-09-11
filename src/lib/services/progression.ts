import "server-only";

import { and, asc, eq, count } from "drizzle-orm";
import { db } from "@/db";
import {
  missions,
  missionProgress,
  missionResponses,
  pathways,
  pathwayProgress,
  results,
  documents,
  notifications,
} from "@/db/schema";
import type { MissionField } from "@/db/schema";

/** Démarre un parcours (idempotent) et renvoie sa progression. */
export async function startPathway(userId: string, pathwayId: string) {
  const total = await db
    .select({ value: count() })
    .from(missions)
    .where(and(eq(missions.pathwayId, pathwayId), eq(missions.isPublished, true)));

  const [row] = await db
    .insert(pathwayProgress)
    .values({
      userId,
      pathwayId,
      status: "in_progress",
      totalCount: total[0]?.value ?? 0,
    })
    .onConflictDoUpdate({
      target: [pathwayProgress.userId, pathwayProgress.pathwayId],
      set: { lastActivityAt: new Date(), totalCount: total[0]?.value ?? 0 },
    })
    .returning();

  return row;
}

/** Marque une mission comme démarrée. */
export async function startMission(userId: string, missionId: string, pathwayId: string) {
  await db
    .insert(missionProgress)
    .values({ userId, missionId, pathwayId, status: "in_progress", startedAt: new Date() })
    .onConflictDoNothing();
  await startPathway(userId, pathwayId);
}

/** Enregistre un brouillon de réponses (sauvegarde automatique). */
export async function saveDraft(
  userId: string,
  missionId: string,
  answers: Record<string, unknown>,
  checkedItems: number[] = [],
) {
  await db
    .insert(missionResponses)
    .values({ userId, missionId, answers, checkedItems })
    .onConflictDoUpdate({
      target: [missionResponses.userId, missionResponses.missionId],
      set: { answers, checkedItems, updatedAt: new Date() },
    });
}

/** Vérifie que tous les champs obligatoires sont renseignés. */
export function validateAnswers(
  fields: MissionField[],
  answers: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required) continue;
    const value = answers[field.key];
    const empty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);
    if (empty) errors[field.key] = "Cette réponse est nécessaire pour valider la mission.";
  }
  return errors;
}

/**
 * Valide une mission : enregistre les réponses, crée le résultat, recalcule
 * la progression du parcours, et clôture le parcours si c'était la dernière.
 */
export async function completeMission(
  userId: string,
  mission: { id: string; pathwayId: string; title: string; resultLabel: string; fields: MissionField[] },
  answers: Record<string, unknown>,
  checkedItems: number[] = [],
) {
  const errors = validateAnswers(mission.fields, answers);
  if (Object.keys(errors).length > 0) return { ok: false as const, errors };

  const now = new Date();

  await db
    .insert(missionResponses)
    .values({ userId, missionId: mission.id, answers, checkedItems, submittedAt: now })
    .onConflictDoUpdate({
      target: [missionResponses.userId, missionResponses.missionId],
      set: { answers, checkedItems, submittedAt: now, updatedAt: now },
    });

  await db
    .insert(missionProgress)
    .values({
      userId,
      missionId: mission.id,
      pathwayId: mission.pathwayId,
      status: "completed",
      startedAt: now,
      completedAt: now,
    })
    .onConflictDoUpdate({
      target: [missionProgress.userId, missionProgress.missionId],
      set: { status: "completed", completedAt: now },
    });

  // Un résultat par mission validée — c'est ce que l'utilisateur retrouve
  // dans « Mes résultats ».
  const summary = buildSummary(mission.fields, answers);
  // On mémorise les libellés avec les réponses : le champ peut changer plus
  // tard, le résultat déjà produit doit rester lisible tel quel.
  const labels = Object.fromEntries(mission.fields.map((f) => [f.key, f.label]));
  const content = { answers, labels };
  const existing = await db
    .select({ id: results.id })
    .from(results)
    .where(and(eq(results.userId, userId), eq(results.missionId, mission.id)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(results)
      .set({ summary, content, updatedAt: now })
      .where(eq(results.id, existing[0].id));
  } else {
    await db.insert(results).values({
      userId,
      type: "mission",
      title: mission.resultLabel || mission.title,
      summary,
      content,
      missionId: mission.id,
      pathwayId: mission.pathwayId,
    });
  }

  const progress = await recalculatePathway(userId, mission.pathwayId);
  return { ok: true as const, progress };
}

/** Recalcule la progression d'un parcours et produit le livrable final si terminé. */
export async function recalculatePathway(userId: string, pathwayId: string) {
  const all = await db
    .select({ id: missions.id })
    .from(missions)
    .where(and(eq(missions.pathwayId, pathwayId), eq(missions.isPublished, true)))
    .orderBy(asc(missions.position));

  const done = await db
    .select({ missionId: missionProgress.missionId })
    .from(missionProgress)
    .where(
      and(
        eq(missionProgress.userId, userId),
        eq(missionProgress.pathwayId, pathwayId),
        eq(missionProgress.status, "completed"),
      ),
    );

  const doneIds = new Set(done.map((d) => d.missionId));
  const total = all.length;
  const completed = all.filter((m) => doneIds.has(m.id)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isDone = total > 0 && completed === total;
  const current = all.find((m) => !doneIds.has(m.id))?.id ?? null;

  const [row] = await db
    .insert(pathwayProgress)
    .values({
      userId,
      pathwayId,
      status: isDone ? "completed" : "in_progress",
      completedCount: completed,
      totalCount: total,
      percent,
      currentMissionId: current,
      lastActivityAt: new Date(),
      completedAt: isDone ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [pathwayProgress.userId, pathwayProgress.pathwayId],
      set: {
        status: isDone ? "completed" : "in_progress",
        completedCount: completed,
        totalCount: total,
        percent,
        currentMissionId: current,
        lastActivityAt: new Date(),
        completedAt: isDone ? new Date() : null,
      },
    })
    .returning();

  if (isDone) await buildPathwayDeliverable(userId, pathwayId);

  return row;
}

/**
 * Assemble le livrable final : toutes les réponses du parcours réunies dans
 * un document Markdown. Aucune IA ici — ce sont les mots de l'utilisateur,
 * simplement structurés.
 */
async function buildPathwayDeliverable(userId: string, pathwayId: string) {
  const pathwayRow = await db.select().from(pathways).where(eq(pathways.id, pathwayId)).limit(1);
  const pathway = pathwayRow[0];
  if (!pathway) return;

  const already = await db
    .select({ id: results.id })
    .from(results)
    .where(
      and(eq(results.userId, userId), eq(results.pathwayId, pathwayId), eq(results.type, "pathway")),
    )
    .limit(1);
  if (already[0]) return;

  const rows = await db
    .select({ mission: missions, response: missionResponses })
    .from(missions)
    .leftJoin(
      missionResponses,
      and(eq(missionResponses.missionId, missions.id), eq(missionResponses.userId, userId)),
    )
    .where(and(eq(missions.pathwayId, pathwayId), eq(missions.isPublished, true)))
    .orderBy(asc(missions.position));

  const lines: string[] = [`# ${pathway.title}`, "", pathway.expectedResult, ""];

  for (const { mission, response } of rows) {
    lines.push(`## ${mission.resultLabel || mission.title}`, "");
    const answers = (response?.answers ?? {}) as Record<string, unknown>;
    for (const field of mission.fields) {
      const value = answers[field.key];
      if (value === undefined || value === null || value === "") continue;
      lines.push(`**${field.label}**`, "", formatValue(value), "");
    }
  }

  const body = lines.join("\n");

  const [result] = await db
    .insert(results)
    .values({
      userId,
      type: "pathway",
      title: pathway.expectedResult || pathway.title,
      summary: `Livrable final du parcours « ${pathway.title} ».`,
      content: { markdown: body },
      pathwayId,
      isPinned: true,
    })
    .returning();

  await db.insert(documents).values({
    userId,
    resultId: result.id,
    title: pathway.expectedResult || pathway.title,
    format: "markdown",
    body,
  });

  await db.insert(notifications).values({
    userId,
    type: "pathway",
    title: "Parcours terminé 🎉",
    body: `Ton livrable « ${pathway.expectedResult || pathway.title} » est disponible dans Mes résultats.`,
    link: `/resultats/${result.id}`,
  });
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => `- ${String(v)}`).join("\n");
  return String(value);
}

function buildSummary(fields: MissionField[], answers: Record<string, unknown>): string {
  for (const field of fields) {
    const value = answers[field.key];
    if (typeof value === "string" && value.trim().length > 12) {
      return value.trim().slice(0, 220);
    }
  }
  const first = Object.values(answers).find((v) => typeof v === "string" && v);
  return typeof first === "string" ? first.slice(0, 220) : "Mission validée.";
}
