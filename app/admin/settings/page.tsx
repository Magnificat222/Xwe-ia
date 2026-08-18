import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Réglages</h1>
      <SettingsForm initialPrice={settings.premiumPriceXof} />
    </div>
  );
}
