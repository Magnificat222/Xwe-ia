import { SupportChat } from "@/components/dashboard/support-chat";

export default function AdminSupportPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl text-ivoire">Salon Premium</h1>
      <p className="mb-4 text-sm text-ivoire-dim">
        Tous les membres Premium partagent ce salon. L'assistant IA répond en
        premier ; interviens quand une réponse mérite ta touche personnelle.
      </p>
      <SupportChat asAdmin />
    </div>
  );
}
