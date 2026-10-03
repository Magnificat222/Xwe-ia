"use server";

// Admin server actions for LearningPath management: metadata, access type and
// price, mission order, and manual access grants. Admin role is re-read from
// the database on every call. Actions return { ok, error } (Next hides thrown
// messages in production).
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/guards";
import { ServiceError } from "@/lib/services/errors";
import { wizards } from "@/lib/wizards";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function run<T extends object>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (error) {
    if (error instanceof ServiceError) return { ok: false, error: error.message };
    if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? "Données invalides." };
    console.error("[paths admin]", error);
    return { ok: false, error: "Erreur serveur." };
  }
}

const nullableText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v));

const pathSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,60}$/, "Slug : 3 à 60 caractères (a-z, 0-9, tiret)."),
  title: z.string().trim().min(3, "Titre trop court.").max(120),
  description: z.string().trim().min(10, "Description trop courte.").max(2000),
  accessType: z.enum(["FREE", "PREMIUM", "CREDITS"]),
  creditCost: z.number().int().min(0).max(100000),
  isPublished: z.boolean(),
  difficulty: z.enum(["DEBUTANT", "INTERMEDIAIRE", "AVANCE"]),
  estimatedMinutes: z.number().int().min(1).max(100000).nullable(),
  resultSummary: nullableText(1000),
  deliverableType: nullableText(60),
  wizardType: nullableText(60),
  categoryId: z.string().nullable(),
  displayOrder: z.number().int().min(0).max(1000),
});

export async function savePath(input: z.input<typeof pathSchema>) {
  return run(async () => {
    await requireAdminId();
    const { id, ...data } = pathSchema.parse(input);

    if (data.accessType === "CREDITS" && data.creditCost <= 0) {
      throw new ServiceError("INVALID_PRICE", "Un parcours en Xwé Crédits doit avoir un coût supérieur à 0.");
    }
    if (data.accessType !== "CREDITS") data.creditCost = 0;
    if (data.wizardType && !wizards[data.wizardType]) {
      throw new ServiceError("UNKNOWN_WIZARD", `Type de projet guidé inconnu : ${data.wizardType}.`);
    }
    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId }, select: { id: true } });
      if (!cat) throw new ServiceError("UNKNOWN_CATEGORY", "Catégorie introuvable.");
    }

    // `isPremium` is the legacy flag still read by older code: keep it in sync.
    const row = { ...data, isPremium: data.accessType === "PREMIUM" };

    try {
      if (id) {
        const { slug: _slug, ...updatable } = row; // the slug of an existing path never changes (links)
        void _slug;
        await prisma.learningPath.update({ where: { id }, data: updatable });
        revalidatePath(`/admin/parcours/${id}`);
        revalidatePath("/parcours");
        revalidatePath(`/parcours/${row.slug}`);
        return { id };
      }
      const created = await prisma.learningPath.create({ data: row, select: { id: true } });
      revalidatePath("/admin/parcours");
      revalidatePath("/parcours");
      return { id: created.id };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new ServiceError("DUPLICATE_SLUG", "Ce slug existe déjà.");
      }
      throw error;
    }
  });
}

// Replaces the ordered list of missions of a path. Progress rows belong to
// missions, not to the join table, so nobody loses progress.
export async function setPathMissions(pathId: string, orderedMissionIds: string[]) {
  return run(async () => {
    await requireAdminId();
    const unique = Array.from(new Set(orderedMissionIds));
    if (unique.length > 200) throw new ServiceError("TOO_MANY", "Trop de missions.");

    const [path, found] = await Promise.all([
      prisma.learningPath.findUnique({ where: { id: pathId }, select: { id: true, slug: true } }),
      prisma.mission.count({ where: { id: { in: unique } } }),
    ]);
    if (!path) throw new ServiceError("NOT_FOUND", "Parcours introuvable.", 404);
    if (found !== unique.length) throw new ServiceError("UNKNOWN_MISSION", "Une mission sélectionnée n'existe plus.");

    await prisma.$transaction([
      prisma.learningPathMission.deleteMany({ where: { learningPathId: pathId } }),
      prisma.learningPathMission.createMany({
        data: unique.map((missionId, index) => ({ learningPathId: pathId, missionId, order: index + 1 })),
      }),
    ]);
    revalidatePath(`/admin/parcours/${pathId}`);
    revalidatePath(`/parcours/${path.slug}`);
    return {};
  });
}

export async function grantPathAccessByEmail(pathId: string, email: string) {
  return run(async () => {
    const adminId = await requireAdminId();
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } });
    if (!user) throw new ServiceError("USER_NOT_FOUND", "Aucun utilisateur avec cet e-mail.", 404);
    const path = await prisma.learningPath.findUnique({ where: { id: pathId }, select: { id: true } });
    if (!path) throw new ServiceError("NOT_FOUND", "Parcours introuvable.", 404);

    await prisma.pathAccess.upsert({
      where: { userId_learningPathId: { userId: user.id, learningPathId: pathId } },
      update: {},
      create: { userId: user.id, learningPathId: pathId, source: "ADMIN_GRANT", grantedById: adminId },
    });
    revalidatePath(`/admin/parcours/${pathId}`);
    return {};
  });
}

// Only gifts can be revoked. Access bought with credits is never removed here:
// refund the credits through an admin adjustment if needed.
export async function revokePathGrant(accessId: string) {
  return run(async () => {
    await requireAdminId();
    const access = await prisma.pathAccess.findUnique({
      where: { id: accessId },
      select: { id: true, source: true, learningPathId: true },
    });
    if (!access) throw new ServiceError("NOT_FOUND", "Accès introuvable.", 404);
    if (access.source !== "ADMIN_GRANT") {
      throw new ServiceError("PAID_ACCESS", "Cet accès a été acheté avec des crédits : il ne peut pas être retiré ici.");
    }
    await prisma.pathAccess.delete({ where: { id: accessId } });
    revalidatePath(`/admin/parcours/${access.learningPathId}`);
    return {};
  });
}
