import { PrismaClient } from "@prisma/client";
import { categories } from "../lib/data/categories";
import { missions } from "../lib/data/missions";
import { tools } from "../lib/data/tools";
import { prompts } from "../lib/data/prompts";
import { learningPaths } from "../lib/data/paths";
import { ebooks } from "../lib/data/ebooks";
import { quizStages } from "../lib/data/quiz-stages";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
      },
    });
    categoryMap.set(category.slug, created.id);
  }

  console.log("Seeding missions...");
  const missionMap = new Map<string, string>();
  for (const mission of missions) {
    const created = await prisma.mission.upsert({
      where: { slug: mission.slug },
      update: {},
      create: {
        slug: mission.slug,
        title: mission.title,
        description: mission.description,
        level: mission.level,
        estimatedMinutes: mission.estimatedMinutes,
        recommendedTools: mission.recommendedTools,
        steps: mission.steps as any,
        tips: mission.tips,
        commonMistakes: mission.commonMistakes,
        checklist: mission.checklist,
        isPremium: mission.isPremium,
        isPublished: true,
        categoryId: categoryMap.get(mission.categorySlug)!,
      },
    });
    missionMap.set(mission.id, created.id);
  }

  console.log("Seeding learning paths...");
  for (const path of learningPaths) {
    const createdPath = await prisma.learningPath.upsert({
      where: { slug: path.slug },
      update: {},
      create: {
        slug: path.slug,
        title: path.title,
        description: path.description,
        isPremium: path.isPremium,
        accessType: path.isPremium ? "PREMIUM" : "FREE",
        isPublished: true,
      },
    });

    for (const [order, mockMissionId] of path.missionIds.entries()) {
      const realMissionId = missionMap.get(mockMissionId);
      if (!realMissionId) continue;
      await prisma.learningPathMission.upsert({
        where: {
          learningPathId_missionId: {
            learningPathId: createdPath.id,
            missionId: realMissionId,
          },
        },
        update: { order },
        create: { order, learningPathId: createdPath.id, missionId: realMissionId },
      });
    }
  }

  // Business Plan flagship path, linked to the existing guided project.
  // Created UNPUBLISHED and never overwritten: the admin sets price/access,
  // adds missions and publishes it from Admin -> Parcours.
  console.log("Seeding Business Plan path...");
  await prisma.learningPath.upsert({
    where: { slug: "business-plan" },
    update: {},
    create: {
      slug: "business-plan",
      title: "Mon business plan",
      description: "Construisez votre business plan étape par étape et téléchargez-le en document Word.",
      resultSummary: "À la fin, vous aurez un business plan structuré, prêt à être téléchargé en .docx.",
      deliverableType: "Document Word (.docx)",
      wizardType: "business-plan",
      accessType: "FREE",
      isPublished: false,
    },
  });

  // Starter credit packs (placeholders: the real prices/amounts are a product
  // decision and are editable in the DB). Never overwritten once they exist.
  console.log("Seeding credit packs...");
  const packs = [
    { code: "pack-decouverte", name: "Pack Découverte", credits: 50, priceXof: 2500, displayOrder: 1 },
    { code: "pack-essentiel", name: "Pack Essentiel", credits: 120, priceXof: 5000, displayOrder: 2 },
    { code: "pack-pro", name: "Pack Pro", credits: 300, priceXof: 10000, displayOrder: 3 },
  ];
  for (const pack of packs) {
    await prisma.creditPack.upsert({ where: { code: pack.code }, update: {}, create: { ...pack, isActive: false } });
  }

  console.log("Seeding tools...");
  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: {},
      create: {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        useCases: tool.useCases,
        pricing: tool.pricing,
        features: tool.features,
        url: tool.url,
        howToUse: tool.howToUse,
      },
    });
  }

  console.log("Seeding prompts...");
  for (const prompt of prompts) {
    await prisma.prompt.upsert({
      where: { id: prompt.id },
      update: {},
      create: {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        tags: prompt.tags,
        isPremium: prompt.isPremium,
        recommendedTools: prompt.recommendedToolIds,
        categoryId: categoryMap.get(prompt.categorySlug)!,
      },
    });
  }

  console.log("Seeding ebooks...");
  for (const ebook of ebooks) {
    await prisma.ebook.upsert({
      where: { slug: ebook.slug },
      update: {},
      create: {
        id: ebook.id,
        slug: ebook.slug,
        title: ebook.title,
        description: ebook.description,
        fileName: ebook.fileName,
        pageCount: ebook.pageCount,
        isPremium: ebook.isPremium,
      },
    });
  }

  console.log("Seeding quiz stages...");
  for (const stage of quizStages) {
    await prisma.quizStage.upsert({
      where: { slug: stage.slug },
      update: {
        title: stage.title,
        description: stage.description,
        topic: stage.topic,
        level: stage.level,
        order: stage.order,
        questionCount: stage.questionCount,
        isPremium: stage.isPremium,
      },
      create: {
        id: stage.id,
        slug: stage.slug,
        title: stage.title,
        description: stage.description,
        topic: stage.topic,
        level: stage.level,
        order: stage.order,
        questionCount: stage.questionCount,
        isPremium: stage.isPremium,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
