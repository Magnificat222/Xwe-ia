import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOverview } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await requireRole("admin", "/admin/notifications");
  const overview = await getAdminOverview();

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <SectionHeading
        eyebrow="Communauté"
        title="Notifications"
        description="Adresse un message à l'ensemble des membres ou aux seuls abonnés Premium."
      />
      <BroadcastForm totalUsers={overview.users} premiumUsers={overview.premium} />
    </PageTransition>
  );
}
