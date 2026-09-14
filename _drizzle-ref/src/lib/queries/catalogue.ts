import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  goals,
  goalPathways,
  pathways,
  missions,
  categories,
  tools,
  prompts,
  resources,
  faqItems,
  legalPages,
  siteSettings,
} from "@/db/schema";

export async function getSettings() {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, "singleton")).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db.insert(siteSettings).values({ id: "singleton" }).returning();
  return created;
}

export async function getCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.position));
}

export type GoalWithMeta = Awaited<ReturnType<typeof getGoals>>[number];

export async function getGoals(options?: { featuredOnly?: boolean }) {
  const rows = await db
    .select({
      goal: goals,
      category: categories,
      pathwayCount: sql<number>`(
        select count(*) from ${goalPathways} gp
        join ${pathways} p on p.id = gp.pathway_id and p.is_published = true
        where gp.goal_id = ${goals.id}
      )`.mapWith(Number),
    })
    .from(goals)
    .leftJoin(categories, eq(goals.categoryId, categories.id))
    .where(
      options?.featuredOnly
        ? and(eq(goals.isActive, true), eq(goals.isFeatured, true))
        : eq(goals.isActive, true),
    )
    .orderBy(asc(goals.position));

  return rows.map((r) => ({ ...r.goal, category: r.category, pathwayCount: r.pathwayCount }));
}

export async function getGoalBySlug(slug: string) {
  const rows = await db
    .select({ goal: goals, category: categories })
    .from(goals)
    .leftJoin(categories, eq(goals.categoryId, categories.id))
    .where(eq(goals.slug, slug))
    .limit(1);
  if (!rows[0]) return null;

  const linked = await db
    .select({ pathway: pathways })
    .from(goalPathways)
    .innerJoin(pathways, eq(goalPathways.pathwayId, pathways.id))
    .where(and(eq(goalPathways.goalId, rows[0].goal.id), eq(pathways.isPublished, true)))
    .orderBy(asc(goalPathways.position));

  return { ...rows[0].goal, category: rows[0].category, pathways: linked.map((l) => l.pathway) };
}

export type PathwayCard = Awaited<ReturnType<typeof getPathways>>[number];

export async function getPathways(options?: { categorySlug?: string; goalSlug?: string; limit?: number }) {
  const conditions = [eq(pathways.isPublished, true)];

  if (options?.goalSlug) {
    const goalRow = await db
      .select({ id: goals.id })
      .from(goals)
      .where(eq(goals.slug, options.goalSlug))
      .limit(1);
    if (!goalRow[0]) return [];
    const links = await db
      .select({ pathwayId: goalPathways.pathwayId })
      .from(goalPathways)
      .where(eq(goalPathways.goalId, goalRow[0].id));
    const ids = links.map((l) => l.pathwayId);
    if (ids.length === 0) return [];
    conditions.push(inArray(pathways.id, ids));
  }

  const rows = await db
    .select({
      pathway: pathways,
      category: categories,
      missionCount: sql<number>`(
        select count(*) from ${missions} m
        where m.pathway_id = ${pathways.id} and m.is_published = true
      )`.mapWith(Number),
    })
    .from(pathways)
    .leftJoin(categories, eq(pathways.categoryId, categories.id))
    .where(
      options?.categorySlug
        ? and(...conditions, eq(categories.slug, options.categorySlug))
        : and(...conditions),
    )
    .orderBy(asc(pathways.position), desc(pathways.createdAt))
    .limit(options?.limit ?? 100);

  return rows.map((r) => ({ ...r.pathway, category: r.category, missionCount: r.missionCount }));
}

export async function getPathwayBySlug(slug: string) {
  const rows = await db
    .select({ pathway: pathways, category: categories })
    .from(pathways)
    .leftJoin(categories, eq(pathways.categoryId, categories.id))
    .where(eq(pathways.slug, slug))
    .limit(1);
  if (!rows[0]) return null;

  const missionRows = await db
    .select()
    .from(missions)
    .where(and(eq(missions.pathwayId, rows[0].pathway.id), eq(missions.isPublished, true)))
    .orderBy(asc(missions.position));

  return { ...rows[0].pathway, category: rows[0].category, missions: missionRows };
}

export async function getMissionBySlug(slug: string) {
  const rows = await db
    .select({ mission: missions, pathway: pathways })
    .from(missions)
    .innerJoin(pathways, eq(missions.pathwayId, pathways.id))
    .where(eq(missions.slug, slug))
    .limit(1);
  if (!rows[0]) return null;

  const siblings = await db
    .select({ id: missions.id, slug: missions.slug, title: missions.title, position: missions.position })
    .from(missions)
    .where(and(eq(missions.pathwayId, rows[0].pathway.id), eq(missions.isPublished, true)))
    .orderBy(asc(missions.position));

  const index = siblings.findIndex((m) => m.id === rows[0].mission.id);

  return {
    ...rows[0].mission,
    pathway: rows[0].pathway,
    siblings,
    previous: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
    index,
    total: siblings.length,
  };
}

export async function getTools(categorySlug?: string) {
  const rows = await db
    .select({ tool: tools, category: categories })
    .from(tools)
    .leftJoin(categories, eq(tools.categoryId, categories.id))
    .where(
      categorySlug
        ? and(eq(tools.isPublished, true), eq(categories.slug, categorySlug))
        : eq(tools.isPublished, true),
    )
    .orderBy(asc(tools.position));
  return rows.map((r) => ({ ...r.tool, category: r.category }));
}

export async function getPrompts() {
  const rows = await db
    .select({ prompt: prompts, category: categories })
    .from(prompts)
    .leftJoin(categories, eq(prompts.categoryId, categories.id))
    .where(eq(prompts.isPublished, true))
    .orderBy(desc(prompts.createdAt));
  return rows.map((r) => ({ ...r.prompt, category: r.category }));
}

export async function getResources() {
  const rows = await db
    .select({ resource: resources, category: categories })
    .from(resources)
    .leftJoin(categories, eq(resources.categoryId, categories.id))
    .where(eq(resources.isPublished, true))
    .orderBy(desc(resources.createdAt));
  return rows.map((r) => ({ ...r.resource, category: r.category }));
}

export async function getFaq() {
  return db
    .select()
    .from(faqItems)
    .where(eq(faqItems.isPublished, true))
    .orderBy(asc(faqItems.position));
}

export async function getLegalPage(slug: string) {
  const rows = await db.select().from(legalPages).where(eq(legalPages.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getLegalPages() {
  return db.select().from(legalPages).where(eq(legalPages.isPublished, true));
}
