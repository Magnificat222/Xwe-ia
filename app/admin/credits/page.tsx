import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditPackForm } from "@/components/admin/credit-pack-form";
import { UserCreditsPanel } from "@/components/admin/user-credits-panel";

export default async function AdminCreditsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/support");

  const packs = await prisma.creditPack.findMany({ orderBy: [{ displayOrder: "asc" }, { priceXof: "asc" }] });

  return (
    <div className="space-y-12">
      <section>
        <h1 className="mb-1 font-display text-2xl text-ivoire">Packs de Xwé Crédits</h1>
        <p className="mb-6 text-sm text-ivoire-dim">
          Les prix et quantités se règlent ici, sans toucher au code. Un pack inactif reste invisible pour les utilisateurs.
          Les packs d'exemple du seed sont inactifs : modifiez-les avant de les activer.
        </p>
        <div className="space-y-3">
          {packs.map((p) => (
            <CreditPackForm
              key={p.id}
              initial={{ id: p.id, code: p.code, name: p.name, credits: p.credits, priceXof: p.priceXof, isActive: p.isActive, displayOrder: p.displayOrder }}
            />
          ))}
          <p className="pt-2 text-xs uppercase tracking-wide text-ivoire-dim">Nouveau pack</p>
          <CreditPackForm isNew initial={{ code: "", name: "", credits: 0, priceXof: 0, isActive: false, displayOrder: packs.length + 1 }} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl text-ivoire">Solde d'un utilisateur</h2>
        <UserCreditsPanel />
      </section>
    </div>
  );
}
