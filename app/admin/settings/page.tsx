import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Réglages</h1>
      <SettingsForm initialPrice={settings.premiumPriceXof} />
      <div className="mt-12 border-t border-ivoire/10 pt-10">
        <PaymentSettingsForm
          initial={{
            manualPaymentsEnabled: settings.manualPaymentsEnabled,
            mtnMomoNumber: settings.mtnMomoNumber ?? "",
            mtnMomoAccountName: settings.mtnMomoAccountName ?? "",
            celtisMoneyNumber: settings.celtisMoneyNumber ?? "",
            celtisMoneyAccountName: settings.celtisMoneyAccountName ?? "",
            paymentInstructions: settings.paymentInstructions ?? "",
            premiumDurationDays: settings.premiumDurationDays,
          }}
        />
      </div>
    </div>
  );
}
