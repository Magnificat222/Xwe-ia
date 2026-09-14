import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireRole } from "@/lib/auth/guards";
import { getSettings } from "@/lib/queries/catalogue";

export const metadata: Metadata = { title: "Paramètres" };

export default async function AdminSettingsPage() {
  await requireRole("admin", "/admin/parametres");
  const settings = await getSettings();

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-6">
      <SectionHeading
        eyebrow="Plateforme"
        title="Paramètres"
        description="Ces réglages s'appliquent immédiatement sur le site public."
      />
      <SettingsForm
        defaults={{
          premiumPriceXof: settings?.premiumPriceXof ?? 5500,
          selfServePremium: settings?.selfServePremium ?? true,
          supportEmail: settings?.supportEmail ?? "contact@xwe-ia.com",
          announcement: settings?.announcement ?? "",
          maintenanceMode: settings?.maintenanceMode ?? false,
        }}
      />
    </PageTransition>
  );
}
