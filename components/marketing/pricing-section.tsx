import { Check, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KkiapayCheckoutButton } from "@/components/marketing/kkiapay-checkout-button";

export function PricingSection({ premiumPriceXof }: { premiumPriceXof: number }) {
  const plans = [
    {
      name: "Gratuit",
      price: "0",
      description: "Pour découvrir la méthode et démarrer vos premières missions.",
      features: [
        "Accès aux missions gratuites",
        "Bibliothèque de prompts (sélection)",
        "Suivi de progression",
        "1 parcours gratuit",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      name: "Premium",
      price: premiumPriceXof.toString(),
      description: "Pour aller jusqu'au résultat, sur tous vos objectifs.",
      features: [
        "Toutes les missions et parcours débloqués",
        "Bibliothèque de prompts complète",
        "Tous les outils IA recommandés",
        "Ebooks téléchargeables",
        "Salon Premium avec l'IA et l'équipe Xwé IA",
        "Badges et statistiques avancées",
      ],
      cta: "Passer Premium",
      highlighted: true,
    },
  ];

  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-lg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Tarifs</p>
        <h2 className="mt-3 font-display text-3xl text-ivoire">Simple, sans surprise</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-or/50 bg-braise/10" : undefined}
          >
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-ivoire">{plan.name}</h3>
                {plan.highlighted && <Star size={16} className="fill-or text-or" />}
              </div>
              <p className="font-display text-2xl text-or">
                {plan.price} FCFA<span className="text-sm text-ivoire-dim"> /mois</span>
              </p>
            </div>
            <p className="mt-2 text-sm text-ivoire-dim">{plan.description}</p>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ivoire">
                  <Check size={16} className="mt-0.5 shrink-0 text-or" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.highlighted ? (
              <div className="mt-6">
                <KkiapayCheckoutButton amountXof={premiumPriceXof} />
              </div>
            ) : (
              <Link href="/register" className="mt-6 block">
                <Button variant="secondary" className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
