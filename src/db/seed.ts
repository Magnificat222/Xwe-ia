/**
 * Injecte le contenu initial de Xwé IA.
 * Idempotent : relancer le script ne duplique rien.
 *
 *   npm run db:seed
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import {
  categories as seedCategories,
  pathways as seedPathways,
  goals as seedGoals,
  tools as seedTools,
  prompts as seedPrompts,
  resources as seedResources,
  games as seedGames,
  faq as seedFaq,
  legalPages as seedLegal,
} from "../content/catalogue";

async function main() {
  const connectionString = process.env.DATABASE_URL ?? "postgres://xwe:xwe@127.0.0.1:5433/xwe";
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  console.log("→ Réglages du site");
  await db
    .insert(schema.siteSettings)
    .values({ id: "singleton" })
    .onConflictDoNothing();

  console.log("→ Catégories");
  const categoryIds = new Map<string, string>();
  for (const [i, cat] of seedCategories.entries()) {
    const [row] = await db
      .insert(schema.categories)
      .values({ ...cat, position: i })
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name: cat.name, description: cat.description, icon: cat.icon, position: i },
      })
      .returning({ id: schema.categories.id });
    categoryIds.set(cat.slug, row.id);
  }

  console.log("→ Parcours et missions");
  const pathwayIds = new Map<string, string>();
  for (const [pi, path] of seedPathways.entries()) {
    const [row] = await db
      .insert(schema.pathways)
      .values({
        slug: path.slug,
        title: path.title,
        summary: path.summary,
        description: path.description,
        categoryId: categoryIds.get(path.category),
        level: path.level,
        accessType: path.accessType,
        priceXof: path.priceXof,
        expectedResult: path.expectedResult,
        accentColor: path.accentColor,
        durationMinutes: path.missions.reduce((sum, m) => sum + m.estimatedMinutes, 0),
        position: pi,
        isPublished: true,
      })
      .onConflictDoUpdate({
        target: schema.pathways.slug,
        set: {
          title: path.title,
          summary: path.summary,
          description: path.description,
          categoryId: categoryIds.get(path.category),
          level: path.level,
          accessType: path.accessType,
          priceXof: path.priceXof,
          expectedResult: path.expectedResult,
          accentColor: path.accentColor,
          durationMinutes: path.missions.reduce((sum, m) => sum + m.estimatedMinutes, 0),
          position: pi,
          isPublished: true,
        },
      })
      .returning({ id: schema.pathways.id });
    pathwayIds.set(path.slug, row.id);

    for (const [mi, mission] of path.missions.entries()) {
      await db
        .insert(schema.missions)
        .values({
          pathwayId: row.id,
          slug: mission.slug,
          title: mission.title,
          objective: mission.objective,
          explanation: mission.explanation,
          instructions: mission.instructions,
          fields: mission.fields,
          prompts: mission.prompts ?? [],
          tips: mission.tips ?? [],
          pitfalls: mission.pitfalls ?? [],
          checklist: mission.checklist ?? [],
          toolIds: mission.tools ?? [],
          resultLabel: mission.resultLabel,
          estimatedMinutes: mission.estimatedMinutes,
          aiAssist: mission.aiAssist ?? false,
          position: mi,
          isPublished: true,
        })
        .onConflictDoUpdate({
          target: schema.missions.slug,
          set: {
            pathwayId: row.id,
            title: mission.title,
            objective: mission.objective,
            explanation: mission.explanation,
            instructions: mission.instructions,
            fields: mission.fields,
            prompts: mission.prompts ?? [],
            tips: mission.tips ?? [],
            pitfalls: mission.pitfalls ?? [],
            checklist: mission.checklist ?? [],
            toolIds: mission.tools ?? [],
            resultLabel: mission.resultLabel,
            estimatedMinutes: mission.estimatedMinutes,
            aiAssist: mission.aiAssist ?? false,
            position: mi,
          },
        });
    }
  }

  console.log("→ Objectifs");
  for (const [gi, goal] of seedGoals.entries()) {
    const [row] = await db
      .insert(schema.goals)
      .values({
        slug: goal.slug,
        title: goal.title,
        tagline: goal.tagline,
        description: goal.description,
        icon: goal.icon,
        outcome: goal.outcome,
        categoryId: categoryIds.get(goal.category),
        isFeatured: goal.featured ?? false,
        position: gi,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.goals.slug,
        set: {
          title: goal.title,
          tagline: goal.tagline,
          description: goal.description,
          icon: goal.icon,
          outcome: goal.outcome,
          categoryId: categoryIds.get(goal.category),
          isFeatured: goal.featured ?? false,
          position: gi,
        },
      })
      .returning({ id: schema.goals.id });

    for (const [pi, pathSlug] of goal.pathways.entries()) {
      const pathwayId = pathwayIds.get(pathSlug);
      if (!pathwayId) continue;
      await db
        .insert(schema.goalPathways)
        .values({ goalId: row.id, pathwayId, position: pi })
        .onConflictDoNothing();
    }
  }

  console.log("→ Outils IA");
  for (const [i, tool] of seedTools.entries()) {
    await db
      .insert(schema.tools)
      .values({
        slug: tool.slug,
        name: tool.name,
        description: tool.description,
        url: tool.url,
        pricing: tool.pricing,
        categoryId: categoryIds.get(tool.category),
        useCases: tool.useCases,
        features: tool.features,
        howToUse: tool.howToUse,
        isFree: tool.isFree,
        position: i,
      })
      .onConflictDoUpdate({
        target: schema.tools.slug,
        set: {
          name: tool.name,
          description: tool.description,
          url: tool.url,
          pricing: tool.pricing,
          useCases: tool.useCases,
          features: tool.features,
          howToUse: tool.howToUse,
          position: i,
        },
      });
  }

  console.log("→ Prompts");
  for (const prompt of seedPrompts) {
    await db
      .insert(schema.prompts)
      .values({
        slug: prompt.slug,
        title: prompt.title,
        body: prompt.body,
        categoryId: categoryIds.get(prompt.category),
        tags: prompt.tags,
        accessType: prompt.accessType,
      })
      .onConflictDoUpdate({
        target: schema.prompts.slug,
        set: { title: prompt.title, body: prompt.body, tags: prompt.tags, accessType: prompt.accessType },
      });
  }

  console.log("→ Ressources");
  for (const resource of seedResources) {
    await db
      .insert(schema.resources)
      .values({
        slug: resource.slug,
        title: resource.title,
        description: resource.description,
        type: resource.type,
        categoryId: categoryIds.get(resource.category),
        accessType: resource.accessType,
      })
      .onConflictDoUpdate({
        target: schema.resources.slug,
        set: { title: resource.title, description: resource.description, type: resource.type },
      });
  }

  console.log("→ Arène");
  for (const [gi, game] of seedGames.entries()) {
    const [row] = await db
      .insert(schema.games)
      .values({
        slug: game.slug,
        title: game.title,
        description: game.description,
        icon: game.icon,
        level: game.level,
        accessType: game.accessType,
        position: gi,
      })
      .onConflictDoUpdate({
        target: schema.games.slug,
        set: { title: game.title, description: game.description, icon: game.icon, position: gi },
      })
      .returning({ id: schema.games.id });

    const existing = await db
      .select({ id: schema.challenges.id })
      .from(schema.challenges)
      .where(eq(schema.challenges.gameId, row.id));

    if (existing.length === 0) {
      for (const [ci, challenge] of game.challenges.entries()) {
        await db.insert(schema.challenges).values({
          gameId: row.id,
          title: challenge.title,
          questions: challenge.questions,
          position: ci,
          points: challenge.questions.length * 10,
        });
      }
    }
  }

  console.log("→ FAQ");
  const faqCount = await db.select({ id: schema.faqItems.id }).from(schema.faqItems);
  if (faqCount.length === 0) {
    await db.insert(schema.faqItems).values(
      seedFaq.map((item, i) => ({
        question: item.question,
        answer: item.answer,
        category: item.category,
        position: i,
      })),
    );
  }

  console.log("→ Pages légales");
  for (const page of seedLegal) {
    await db
      .insert(schema.legalPages)
      .values({ slug: page.slug, title: page.title, body: page.body })
      .onConflictDoUpdate({
        target: schema.legalPages.slug,
        set: { title: page.title, body: page.body },
      });
  }

  // Comptes de démonstration — uniquement hors production.
  if (process.env.NODE_ENV !== "production" || process.env.SEED_DEMO_USERS === "true") {
    console.log("→ Comptes de démonstration");
    const demoAccounts = [
      { email: "admin@xwe-ia.com", name: "Admin Xwé", role: "admin" as const, password: "admin1234" },
      { email: "demo@xwe-ia.com", name: "Awa Demo", role: "user" as const, password: "demo1234" },
    ];

    for (const account of demoAccounts) {
      const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, account.email))
        .limit(1);
      if (existing.length > 0) continue;

      const [user] = await db
        .insert(schema.users)
        .values({
          email: account.email,
          name: account.name,
          role: account.role,
          passwordHash: await bcrypt.hash(account.password, 12),
          emailVerifiedAt: new Date(),
          onboardedAt: new Date(),
        })
        .returning({ id: schema.users.id });

      await db.insert(schema.profiles).values({
        userId: user.id,
        displayName: account.name,
        domain: account.role === "admin" ? "Plateforme" : "Entrepreneuriat",
        level: "intermediaire",
        interests: ["Business", "IA", "Marketing"],
      });

      await db.insert(schema.subscriptions).values({
        userId: user.id,
        plan: account.role === "admin" ? "premium" : "free",
        status: "active",
      });

      await db.insert(schema.notifications).values({
        userId: user.id,
        type: "system",
        title: "Bienvenue sur Xwé IA",
        body: "Choisis un objectif pour démarrer ton premier parcours.",
        link: "/objectifs",
      });
    }

    // Une discussion d'amorce pour que la communauté ne soit pas vide.
    const discussionCount = await db.select({ id: schema.discussions.id }).from(schema.discussions);
    if (discussionCount.length === 0) {
      const [admin] = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, "admin@xwe-ia.com"))
        .limit(1);
      if (admin) {
        await db.insert(schema.discussions).values([
          {
            authorId: admin.id,
            title: "Présente-toi et dis-nous ton objectif",
            body: "Bienvenue dans la Discussion Xwé IA. En une ou deux phrases : qui es-tu, et qu'est-ce que tu veux accomplir en ce moment ? On avance mieux quand on sait où va chacun.",
            categoryId: categoryIds.get("projet"),
            isPinned: true,
          },
          {
            authorId: admin.id,
            title: "Quel outil IA t'a fait gagner le plus de temps ?",
            body: "Partage l'outil qui t'a réellement changé une tâche du quotidien, et comment tu l'utilises concrètement.",
            categoryId: categoryIds.get("ia"),
          },
        ]);
      }
    }
  }

  await pool.end();
  console.log("\n✓ Contenu injecté.");
  console.log("  Admin : admin@xwe-ia.com / admin1234");
  console.log("  Démo  : demo@xwe-ia.com  / demo1234");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
