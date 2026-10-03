import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { PaymentReviewActions } from "@/components/admin/payment-review-actions";

const PROVIDER_LABEL = { MTN_MOMO: "MTN Mobile Money", CELTIS_MONEY: "Celtis Money" } as const;
const STATUS_LABEL = { PENDING: "En attente", APPROVED: "Approuvé", REJECTED: "Refusé" } as const;

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/support");

  const [pending, history] = await Promise.all([
    prisma.paymentRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.paymentRequest.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 50,
      include: { user: { select: { email: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-1 font-display text-2xl text-ivoire">Paiements à valider</h1>
        <p className="mb-6 text-sm text-ivoire-dim">
          Vérifiez le SMS de confirmation sur votre compte marchand (montant, référence, numéro) avant d'approuver.
        </p>
        {pending.length === 0 && <p className="text-sm text-ivoire-dim">Aucune demande en attente.</p>}
        <div className="space-y-3">
          {pending.map((p) => {
            const what = p.purpose === "PREMIUM" ? "Premium (1 période)" : `${p.creditAmount} Xwé Crédits`;
            const summary = `${p.user?.email ?? "?"} — ${PROVIDER_LABEL[p.provider]}\nRéf. ${p.transactionRef}\n${p.amountXof} FCFA → ${what}`;
            return (
              <div key={p.id} className="rounded-card border border-or/25 bg-noir-elevated p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p className="text-ivoire">
                      <span className="font-display">{p.amountXof.toLocaleString("fr-FR")} FCFA</span> — {what}
                    </p>
                    <p className="text-ivoire-dim">{p.user?.name ?? "—"} · {p.user?.email ?? "compte supprimé"}</p>
                    <p className="text-ivoire-dim">
                      {PROVIDER_LABEL[p.provider]} · tél. payeur {p.payerPhone}
                    </p>
                    <p className="font-mono text-xs text-or">Réf. {p.transactionRef}</p>
                    <p className="text-xs text-ivoire-dim">{p.createdAt.toLocaleString("fr-FR")}</p>
                  </div>
                  <div className="w-full sm:w-72">
                    <PaymentReviewActions requestId={p.id} summary={summary} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl text-ivoire">Historique récent</h2>
        <div className="overflow-x-auto rounded-card border border-ivoire/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-noir-elevated text-ivoire-dim">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Utilisateur</th>
                <th className="px-4 py-3 font-medium">Montant</th>
                <th className="px-4 py-3 font-medium">Réf.</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.id} className="border-t border-ivoire/10 text-ivoire">
                  <td className="px-4 py-3 text-ivoire-dim">{(p.reviewedAt ?? p.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-ivoire-dim">{p.user?.email ?? "—"}</td>
                  <td className="px-4 py-3">{p.amountXof.toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.transactionRef}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "APPROVED" ? "feuillage" : "default"}>{STATUS_LABEL[p.status]}</Badge>
                    {p.rejectionReason && <span className="ml-2 text-xs text-ivoire-dim">{p.rejectionReason}</span>}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ivoire-dim">Rien pour l'instant.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
