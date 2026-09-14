import "server-only";

import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  profiles,
  goals,
  pathways,
  missions,
  categories,
  tools,
  resources,
  discussions,
  reports,
  payments,
  subscriptions,
  results,
  pathwayProgress,
  supportTickets,
  legalPages,
  auditLogs,
  games,
} from "@/db/schema";

/** Tableau de bord de l'administration : tout en une passe. */
export async function getAdminOverview() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    newUsers,
    premiumCount,
    pathwayCount,
    missionCount,
    resultCount,
    revenue,
    pendingPayments,
    openReports,
    openTickets,
    activePathways,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, since)),
    db
      .select({ value: count() })
      .from(subscriptions)
      .where(and(eq(subscriptions.plan, "premium"), eq(subscriptions.status, "active"))),
    db.select({ value: count() }).from(pathways),
    db.select({ value: count() }).from(missions),
    db.select({ value: count() }).from(results),
    db
      .select({ value: sql<number>`coalesce(sum(${payments.amountXof}), 0)`.mapWith(Number) })
      .from(payments)
      .where(eq(payments.status, "completed")),
    db.select({ value: count() }).from(payments).where(eq(payments.status, "pending")),
    db.select({ value: count() }).from(reports).where(eq(reports.status, "open")),
    db.select({ value: count() }).from(supportTickets).where(eq(supportTickets.status, "open")),
    db
      .select({ value: count() })
      .from(pathwayProgress)
      .where(eq(pathwayProgress.status, "in_progress")),
  ]);

  return {
    users: userCount[0]?.value ?? 0,
    newUsers: newUsers[0]?.value ?? 0,
    premium: premiumCount[0]?.value ?? 0,
    pathways: pathwayCount[0]?.value ?? 0,
    missions: missionCount[0]?.value ?? 0,
    results: resultCount[0]?.value ?? 0,
    revenueXof: revenue[0]?.value ?? 0,
    pendingPayments: pendingPayments[0]?.value ?? 0,
    openReports: openReports[0]?.value ?? 0,
    openTickets: openTickets[0]?.value ?? 0,
    activePathways: activePathways[0]?.value ?? 0,
  };
}

/** Les parcours les plus suivis — sert à décider quoi enrichir. */
export async function getTopPathways(limit = 6) {
  const rows = await db
    .select({
      id: pathways.id,
      title: pathways.title,
      slug: pathways.slug,
      accessType: pathways.accessType,
      learners: count(pathwayProgress.id),
      completed: sql<number>`count(*) filter (where ${pathwayProgress.status} = 'completed')`.mapWith(
        Number,
      ),
    })
    .from(pathways)
    .leftJoin(pathwayProgress, eq(pathwayProgress.pathwayId, pathways.id))
    .groupBy(pathways.id, pathways.title, pathways.slug, pathways.accessType)
    .orderBy(desc(count(pathwayProgress.id)))
    .limit(limit);
  return rows;
}

export async function getAdminUsers(options?: { q?: string; role?: string }) {
  const filters = [];
  if (options?.q) {
    filters.push(or(ilike(users.email, `%${options.q}%`), ilike(users.name, `%${options.q}%`))!);
  }
  if (options?.role) filters.push(eq(users.role, options.role as never));

  const rows = await db
    .select({
      user: users,
      displayName: profiles.displayName,
      plan: subscriptions.plan,
      status: subscriptions.status,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return rows.map((r) => ({
    ...r.user,
    displayName: r.displayName,
    plan: r.status === "active" ? (r.plan ?? "free") : "free",
  }));
}

export async function getAdminGoals() {
  const rows = await db
    .select({
      goal: goals,
      category: categories,
      pathwayCount: sql<number>`(
        select count(*) from goal_pathways gp where gp.goal_id = ${goals.id}
      )`.mapWith(Number),
    })
    .from(goals)
    .leftJoin(categories, eq(goals.categoryId, categories.id))
    .orderBy(goals.position);
  return rows.map((r) => ({ ...r.goal, category: r.category, pathwayCount: r.pathwayCount }));
}

export async function getAdminPathways() {
  const rows = await db
    .select({
      pathway: pathways,
      category: categories,
      missionCount: sql<number>`(
        select count(*) from missions m where m.pathway_id = ${pathways.id}
      )`.mapWith(Number),
      learners: sql<number>`(
        select count(*) from pathway_progress pp where pp.pathway_id = ${pathways.id}
      )`.mapWith(Number),
    })
    .from(pathways)
    .leftJoin(categories, eq(pathways.categoryId, categories.id))
    .orderBy(pathways.position);
  return rows.map((r) => ({
    ...r.pathway,
    category: r.category,
    missionCount: r.missionCount,
    learners: r.learners,
  }));
}

export async function getAdminMissions(pathwayId?: string) {
  const rows = await db
    .select({ mission: missions, pathway: pathways })
    .from(missions)
    .innerJoin(pathways, eq(missions.pathwayId, pathways.id))
    .where(pathwayId ? eq(missions.pathwayId, pathwayId) : undefined)
    .orderBy(pathways.position, missions.position);
  return rows.map((r) => ({ ...r.mission, pathway: r.pathway }));
}

export async function getAdminCategories() {
  return db.select().from(categories).orderBy(categories.position);
}

export async function getAdminTools() {
  return db.select().from(tools).orderBy(tools.position);
}

export async function getAdminResources() {
  return db.select().from(resources).orderBy(desc(resources.createdAt));
}

export async function getAdminGames() {
  return db.select().from(games).orderBy(games.position);
}

export async function getAdminDiscussions() {
  const rows = await db
    .select({ discussion: discussions, authorName: users.name })
    .from(discussions)
    .leftJoin(users, eq(discussions.authorId, users.id))
    .orderBy(desc(discussions.lastActivityAt))
    .limit(80);
  return rows.map((r) => ({ ...r.discussion, authorName: r.authorName }));
}

export async function getAdminReports() {
  const rows = await db
    .select({ report: reports, reporterName: users.name })
    .from(reports)
    .leftJoin(users, eq(reports.reporterId, users.id))
    .orderBy(desc(reports.createdAt))
    .limit(80);
  return rows.map((r) => ({ ...r.report, reporterName: r.reporterName }));
}

export async function getAdminPayments() {
  const rows = await db
    .select({ payment: payments, email: users.email })
    .from(payments)
    .leftJoin(users, eq(payments.userId, users.id))
    .orderBy(desc(payments.createdAt))
    .limit(100);
  return rows.map((r) => ({ ...r.payment, email: r.email }));
}

export async function getAdminSubscriptions() {
  const rows = await db
    .select({ subscription: subscriptions, email: users.email, name: users.name })
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(100);
  return rows.map((r) => ({ ...r.subscription, email: r.email, name: r.name }));
}

export async function getAdminTickets() {
  const rows = await db
    .select({ ticket: supportTickets, email: users.email })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.updatedAt))
    .limit(80);
  return rows.map((r) => ({ ...r.ticket, userEmail: r.email }));
}

export async function getAdminLegalPages() {
  return db.select().from(legalPages).orderBy(legalPages.slug);
}

export async function getAuditLogs(limit = 60) {
  const rows = await db
    .select({ log: auditLogs, email: users.email })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r.log, actorEmail: r.email }));
}

/** Inscriptions par jour sur les 14 derniers jours, pour le graphique. */
export async function getSignupTrend() {
  const rows = await db
    .select({
      day: sql<string>`to_char(${users.createdAt}, 'YYYY-MM-DD')`,
      value: count(),
    })
    .from(users)
    .where(gte(users.createdAt, new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)))
    .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM-DD')`);
  return rows;
}
