import { prisma } from "@/lib/prisma";

const DEFAULTS = { id: "singleton", premiumPriceXof: 3200 };

// Reads the singleton settings row, creating it with defaults on first use
// so the site never needs a manual seed step just for this.
//
// Wrapped defensively: right after a schema change, the SiteSettings table
// can briefly not exist yet in production (the build runs before `prisma db
// push` does). Rather than crash every page that reads settings during that
// window, fall back to the hard-coded defaults — worst case the Premium
// price is briefly stale, which beats the whole site failing to build.
export async function getSiteSettings() {
  try {
    const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (existing) return existing;
    return await prisma.siteSettings.create({ data: { id: "singleton" } });
  } catch {
    return DEFAULTS;
  }
}
