"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/guards";

// The Premium price is the amount charged for manual payments (and, later, the
// amount the Kkiapay check compares against): it must be a positive integer.
const siteSettingsSchema = z.object({
  premiumPriceXof: z.number().int().min(1).max(10_000_000),
});

export async function updateSiteSettings(input: { premiumPriceXof: number }) {
  // Role re-read from the database (the JWT role can be stale), see lib/guards.ts.
  await requireAdminId();
  const data = siteSettingsSchema.parse(input);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
}
