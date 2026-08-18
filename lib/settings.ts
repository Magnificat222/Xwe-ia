import { prisma } from "@/lib/prisma";

// Reads the singleton settings row, creating it with defaults on first use
// so the site never needs a manual seed step just for this.
export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  return prisma.siteSettings.create({ data: { id: "singleton" } });
}
