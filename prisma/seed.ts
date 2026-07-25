import { PrismaClient } from "@prisma/client";
import { categories } from "../lib/data/categories";
import { missions } from "../lib/data/missions";
import { tools } from "../lib/data/tools";
import { prompts } from "../lib/data/prompts";
import { learningPaths } from "../lib/data/paths";

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
        steps: mission.steps,
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
        categoryId: categoryMap.get(prompt.categorySlug)!,
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
