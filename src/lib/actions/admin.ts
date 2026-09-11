"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  goals,
  pathways,
  missions,
  categories,
  tools,
  discussions,
  reports,
  payments,
  purchases,
  subscriptions,
  notifications,
  legalPages,
  siteSettings,
  supportTickets,
  auditLogs,
  type Role,
  type MissionField,
} from "@/db/schema";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";
import type { ActionState } from "./auth";

/**
 * Toute écriture d'administration passe par ici : un rôle est exigé, puis
 * l'action est tracée dans le journal d'audit. Aucune de ces fonctions n'est
 * appelable depuis le client sans session valide.
 */
async function logAction(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
) {
  await db.insert(auditLogs).values({ actorId, action, entity, entityId, metadata });
}

/* ---------------------------- Utilisateurs --------------------------- */

export async function setUserRoleAction(userId: string, role: Role): Promise<ActionState> {
  const admin = await requireRole("admin");

  // Un administrateur ne peut pas se déclasser lui-même : cela pourrait
  // verrouiller la plateforme sans administrateur restant.
  if (userId === admin.id) return { error: "Tu ne peux pas modifier ton propre rôle." };
  // Seul un super administrateur peut nommer un super administrateur.
  if (role === "super_admin" && admin.role !== "super_admin") {
    return { error: "Seul un super administrateur peut accorder ce rôle." };
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));
  await logAction(admin.id, "user.role", "user", userId, { role });
  revalidatePath("/admin/utilisateurs");
  return { success: "Rôle mis à jour." };
}

export async function toggleBanAction(userId: string): Promise<ActionState> {
  const admin = await requireRole("moderator");
  if (userId === admin.id) return { error: "Tu ne peux pas te bannir toi-même." };

  const rows = await db
    .select({ isBanned: users.isBanned, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!rows[0]) return { error: "Utilisateur introuvable." };
  if (rows[0].role !== "user" && admin.role !== "super_admin") {
    return { error: "Tu ne peux pas suspendre un membre de l'équipe." };
  }

  const next = !rows[0].isBanned;
  await db.update(users).set({ isBanned: next }).where(eq(users.id, userId));
  await logAction(admin.id, next ? "user.ban" : "user.unban", "user", userId);
  revalidatePath("/admin/utilisateurs");
  return { success: next ? "Compte suspendu." : "Compte réactivé." };
}

export async function grantPremiumAction(userId: string, months: number): Promise<ActionState> {
  const admin = await requireRole("admin");
  const end = new Date();
  end.setMonth(end.getMonth() + months);

  await db
    .insert(subscriptions)
    .values({
      userId,
      plan: "premium",
      status: "active",
      currentPeriodEnd: end,
      grantedBy: admin.id,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: { plan: "premium", status: "active", currentPeriodEnd: end, grantedBy: admin.id },
    });

  await db.insert(notifications).values({
    userId,
    type: "system",
    title: "Premium activé",
    body: `L'équipe Xwé IA t'a offert ${months} mois de Premium.`,
    link: "/premium",
  });

  await logAction(admin.id, "user.grant_premium", "user", userId, { months });
  revalidatePath("/admin/utilisateurs");
  return { success: `Premium accordé pour ${months} mois.` };
}

export async function revokePremiumAction(userId: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  await db
    .update(subscriptions)
    .set({ status: "canceled", plan: "free" })
    .where(eq(subscriptions.userId, userId));
  await logAction(admin.id, "user.revoke_premium", "user", userId);
  revalidatePath("/admin/utilisateurs");
  return { success: "Premium retiré." };
}

/* ------------------------------ Objectifs ---------------------------- */

export async function saveGoalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) return { fieldErrors: { title: "Titre trop court." } };

  const values = {
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? "Target"),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    position: Number(formData.get("position") ?? 0),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  };

  if (id) {
    await db.update(goals).set(values).where(eq(goals.id, id));
    await logAction(admin.id, "goal.update", "goal", id);
  } else {
    const [row] = await db.insert(goals).values(values).returning({ id: goals.id });
    await logAction(admin.id, "goal.create", "goal", row.id);
  }

  revalidatePath("/admin/objectifs");
  revalidatePath("/objectifs");
  revalidatePath("/");
  return { success: "Objectif enregistré." };
}

export async function toggleGoalAction(id: string): Promise<void> {
  const admin = await requireRole("admin");
  const rows = await db.select({ isActive: goals.isActive }).from(goals).where(eq(goals.id, id)).limit(1);
  if (!rows[0]) return;
  await db.update(goals).set({ isActive: !rows[0].isActive }).where(eq(goals.id, id));
  await logAction(admin.id, "goal.toggle", "goal", id, { isActive: !rows[0].isActive });
  revalidatePath("/admin/objectifs");
  revalidatePath("/objectifs");
}

/* ------------------------------ Parcours ----------------------------- */

export async function savePathwayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) return { fieldErrors: { title: "Titre trop court." } };

  const accessType = String(formData.get("accessType") ?? "free") as "free" | "paid" | "premium";
  const priceXof = accessType === "paid" ? Number(formData.get("priceXof") ?? 0) : 0;

  const values = {
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title),
    summary: String(formData.get("summary") ?? ""),
    description: String(formData.get("description") ?? ""),
    expectedResult: String(formData.get("expectedResult") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    level: String(formData.get("level") ?? "debutant") as "debutant" | "intermediaire" | "avance",
    durationMinutes: Number(formData.get("durationMinutes") ?? 60),
    accessType,
    priceXof,
    imageUrl: String(formData.get("imageUrl") ?? "") || null,
    position: Number(formData.get("position") ?? 0),
    isPublished: formData.get("isPublished") === "on",
  };

  if (id) {
    await db.update(pathways).set(values).where(eq(pathways.id, id));
    await logAction(admin.id, "pathway.update", "pathway", id);
  } else {
    const [row] = await db.insert(pathways).values(values).returning({ id: pathways.id });
    await logAction(admin.id, "pathway.create", "pathway", row.id);
  }

  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
  return { success: "Parcours enregistré." };
}

export async function togglePathwayAction(id: string): Promise<void> {
  const admin = await requireRole("admin");
  const rows = await db
    .select({ isPublished: pathways.isPublished })
    .from(pathways)
    .where(eq(pathways.id, id))
    .limit(1);
  if (!rows[0]) return;
  await db.update(pathways).set({ isPublished: !rows[0].isPublished }).where(eq(pathways.id, id));
  await logAction(admin.id, "pathway.toggle", "pathway", id);
  revalidatePath("/admin/parcours");
  revalidatePath("/parcours");
}

/* ------------------------------ Missions ----------------------------- */

export async function saveMissionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const pathwayId = String(formData.get("pathwayId") ?? "");
  if (title.length < 3) return { fieldErrors: { title: "Titre trop court." } };
  if (!pathwayId) return { fieldErrors: { pathwayId: "Choisis un parcours." } };

  const lines = (name: string) =>
    String(formData.get(name) ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  // Les champs sont saisis en JSON : c'est la structure la plus fidèle au
  // schéma, et elle reste éditable tant qu'un éditeur visuel n'existe pas.
  let fields: MissionField[] = [];
  const rawFields = String(formData.get("fields") ?? "").trim();
  if (rawFields) {
    try {
      const parsed = JSON.parse(rawFields);
      if (!Array.isArray(parsed)) throw new Error("format");
      fields = parsed as MissionField[];
    } catch {
      return { fieldErrors: { fields: "JSON invalide : attendu un tableau de champs." } };
    }
  }

  const values = {
    pathwayId,
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title),
    objective: String(formData.get("objective") ?? ""),
    explanation: String(formData.get("explanation") ?? ""),
    instructions: lines("instructions"),
    tips: lines("tips"),
    pitfalls: lines("pitfalls"),
    checklist: lines("checklist"),
    fields,
    resultLabel: String(formData.get("resultLabel") ?? ""),
    aiAssist: formData.get("aiAssist") === "on",
    estimatedMinutes: Number(formData.get("estimatedMinutes") ?? 20),
    position: Number(formData.get("position") ?? 0),
    isPublished: formData.get("isPublished") === "on",
  };

  if (id) {
    await db.update(missions).set(values).where(eq(missions.id, id));
    await logAction(admin.id, "mission.update", "mission", id);
  } else {
    const [row] = await db.insert(missions).values(values).returning({ id: missions.id });
    await logAction(admin.id, "mission.create", "mission", row.id);
  }

  revalidatePath("/admin/missions");
  return { success: "Mission enregistrée." };
}

/* ----------------------------- Catégories ---------------------------- */

export async function saveCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { fieldErrors: { name: "Nom trop court." } };

  const values = {
    name,
    slug: String(formData.get("slug") ?? "").trim() || slugify(name),
    description: String(formData.get("description") ?? ""),
    icon: String(formData.get("icon") ?? "Folder"),
    position: Number(formData.get("position") ?? 0),
  };

  if (id) await db.update(categories).set(values).where(eq(categories.id, id));
  else await db.insert(categories).values(values);

  await logAction(admin.id, id ? "category.update" : "category.create", "category", id);
  revalidatePath("/admin/categories");
  return { success: "Catégorie enregistrée." };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const admin = await requireRole("admin");
  await db.delete(categories).where(eq(categories.id, id));
  await logAction(admin.id, "category.delete", "category", id);
  revalidatePath("/admin/categories");
}

/* -------------------------------- Outils ----------------------------- */

export async function saveToolAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { fieldErrors: { name: "Nom trop court." } };

  const values = {
    name,
    slug: String(formData.get("slug") ?? "").trim() || slugify(name),
    description: String(formData.get("description") ?? ""),
    url: String(formData.get("url") ?? ""),
    pricing: String(formData.get("pricing") ?? ""),
    categoryId: String(formData.get("categoryId") ?? "") || null,
    useCases: String(formData.get("useCases") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    isFree: formData.get("isFree") === "on",
    isPublished: formData.get("isPublished") === "on",
    position: Number(formData.get("position") ?? 0),
  };

  if (id) await db.update(tools).set(values).where(eq(tools.id, id));
  else await db.insert(tools).values(values);

  await logAction(admin.id, id ? "tool.update" : "tool.create", "tool", id);
  revalidatePath("/admin/outils");
  revalidatePath("/outils");
  return { success: "Outil enregistré." };
}

export async function deleteToolAction(id: string): Promise<void> {
  const admin = await requireRole("admin");
  await db.delete(tools).where(eq(tools.id, id));
  await logAction(admin.id, "tool.delete", "tool", id);
  revalidatePath("/admin/outils");
  revalidatePath("/outils");
}

/* ----------------------------- Modération ---------------------------- */

export async function moderateDiscussionAction(
  id: string,
  operation: "pin" | "lock" | "delete",
): Promise<void> {
  const admin = await requireRole("moderator");

  if (operation === "delete") {
    await db.delete(discussions).where(eq(discussions.id, id));
  } else {
    const rows = await db
      .select({ isPinned: discussions.isPinned, isLocked: discussions.isLocked })
      .from(discussions)
      .where(eq(discussions.id, id))
      .limit(1);
    if (!rows[0]) return;
    await db
      .update(discussions)
      .set(
        operation === "pin"
          ? { isPinned: !rows[0].isPinned }
          : { isLocked: !rows[0].isLocked },
      )
      .where(eq(discussions.id, id));
  }

  await logAction(admin.id, `discussion.${operation}`, "discussion", id);
  revalidatePath("/admin/discussion");
  revalidatePath("/discussion");
}

export async function resolveReportAction(
  id: string,
  status: "reviewing" | "resolved" | "dismissed",
): Promise<void> {
  const admin = await requireRole("moderator");
  await db
    .update(reports)
    .set({ status, handledBy: admin.id, updatedAt: new Date() })
    .where(eq(reports.id, id));
  await logAction(admin.id, "report.resolve", "report", id, { status });
  revalidatePath("/admin/signalements");
}

/* ------------------------------ Paiements ---------------------------- */

export async function markPaymentPaidAction(id: string): Promise<ActionState> {
  const admin = await requireRole("admin");
  const rows = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  const payment = rows[0];
  if (!payment) return { error: "Paiement introuvable." };
  if (payment.status === "completed") return { error: "Ce paiement est déjà validé." };

  await db
    .update(payments)
    .set({ status: "completed", paidAt: new Date() })
    .where(eq(payments.id, id));

  // On ouvre l'accès correspondant, exactement comme le fera le webhook.
  if (payment.kind === "premium") {
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    await db
      .insert(subscriptions)
      .values({ userId: payment.userId, plan: "premium", status: "active", currentPeriodEnd: end })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: { plan: "premium", status: "active", currentPeriodEnd: end },
      });
  } else if (payment.targetId) {
    await db
      .insert(purchases)
      .values({
        userId: payment.userId,
        kind: "pathway",
        pathwayId: payment.targetId,
        paymentId: payment.id,
        amountXof: payment.amountXof,
      })
      .onConflictDoNothing();
  }

  await db.insert(notifications).values({
    userId: payment.userId,
    type: "payment",
    title: "Paiement confirmé",
    body: "Ton accès a été ouvert. Bonne progression !",
    link: payment.kind === "premium" ? "/premium" : "/parcours",
  });

  await logAction(admin.id, "payment.mark_paid", "payment", id);
  revalidatePath("/admin/paiements");
  return { success: "Paiement validé et accès ouvert." };
}

/* ---------------------------- Pages légales -------------------------- */

export async function saveLegalPageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3) return { fieldErrors: { title: "Titre trop court." } };

  const values = {
    title,
    slug: String(formData.get("slug") ?? "").trim() || slugify(title),
    body: String(formData.get("body") ?? ""),
    isPublished: formData.get("isPublished") === "on",
    updatedAt: new Date(),
  };

  if (id) await db.update(legalPages).set(values).where(eq(legalPages.id, id));
  else await db.insert(legalPages).values(values);

  await logAction(admin.id, id ? "legal.update" : "legal.create", "legal_page", id);
  revalidatePath("/admin/legal");
  revalidatePath(`/legal/${values.slug}`);
  return { success: "Page enregistrée." };
}

/* ----------------------------- Paramètres ---------------------------- */

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const values = {
    premiumPriceXof: Number(formData.get("premiumPriceXof") ?? 5500),
    selfServePremium: formData.get("selfServePremium") === "on",
    supportEmail: String(formData.get("supportEmail") ?? "contact@xwe-ia.com"),
    announcement: String(formData.get("announcement") ?? "") || null,
    maintenanceMode: formData.get("maintenanceMode") === "on",
    updatedAt: new Date(),
  };

  if (values.premiumPriceXof < 0) {
    return { fieldErrors: { premiumPriceXof: "Le prix ne peut pas être négatif." } };
  }

  await db
    .insert(siteSettings)
    .values({ id: "singleton", ...values })
    .onConflictDoUpdate({ target: siteSettings.id, set: values });

  await logAction(admin.id, "settings.update", "site_settings", "singleton", values);
  revalidatePath("/admin/parametres");
  revalidatePath("/premium");
  revalidatePath("/tarifs");
  return { success: "Paramètres enregistrés." };
}

/* ------------------------------- Support ----------------------------- */

export async function setTicketStatusAction(
  id: string,
  status: "open" | "pending" | "closed",
): Promise<void> {
  const admin = await requireRole("moderator");
  await db
    .update(supportTickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(supportTickets.id, id));
  await logAction(admin.id, "ticket.status", "support_ticket", id, { status });
  revalidatePath("/admin/support");
}

/* ---------------------------- Notifications -------------------------- */

export async function broadcastNotificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("admin");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");

  const fieldErrors: Record<string, string> = {};
  if (title.length < 3) fieldErrors.title = "Titre trop court.";
  if (body.length < 5) fieldErrors.body = "Message trop court.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // Un lien d'annonce ne peut pointer qu'à l'intérieur de Xwé IA : cela évite
  // de transformer les notifications en vecteur de redirection externe.
  if (link && !link.startsWith("/")) {
    return { fieldErrors: { link: "Le lien doit être un chemin interne commençant par /." } };
  }

  const recipients =
    audience === "premium"
      ? await db
          .select({ id: users.id })
          .from(users)
          .innerJoin(subscriptions, eq(subscriptions.userId, users.id))
          .where(and(eq(subscriptions.plan, "premium"), eq(subscriptions.status, "active")))
      : await db.select({ id: users.id }).from(users).where(eq(users.isBanned, false));

  if (recipients.length === 0) return { error: "Aucun destinataire." };

  await db.insert(notifications).values(
    recipients.map((recipient) => ({
      userId: recipient.id,
      type: "system" as const,
      title,
      body,
      link: link || null,
    })),
  );

  await logAction(admin.id, "notification.broadcast", "notification", undefined, {
    audience,
    recipients: recipients.length,
  });

  return { success: `Annonce envoyée à ${recipients.length} membre(s).` };
}
