import { Check, Star, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KkiapayCheckoutButton } from "@/components/marketing/kkiapay-checkout-button";
import { DEFAULT_PATH_OFFERS } from "@/lib/access";

export function PricingSection({
  premiumPriceXof,
  selfServeEnabled,
}: {
  premiumPriceXof: number;
  selfServeEnabled: boolean;
}) {
  const plans = [
    {
      name: "Gratuit",
      price: "0",
      subtitle: "Découvre Xwé IA sans frais",
      description: "Pour tester l’approche, participer à la communauté et utiliser les outils de base.",
      features: [
        "Discussion communautaire",
        "Arène de jeux et défis",
        "Outils IA gratuits",
        "Quelques parcours de découverte",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      name: "À l’objectif",
      price: "500 à 2 500",
      subtitle: "Un achat unique pour un résultat précis",
      description: "Tu achètes le parcours qui correspond à ce que tu veux accomplir et tu débloques tout le suivi associé.",
      features: DEFAULT_PATH_OFFERS.map((offer) => `${offer.title} — ${offer.priceXof.toLocaleString("fr-FR")} FCFA`),
      cta: "Choisir un parcours",
      highlighted: true,
    },
    {
      name: "Premium",
      price: `${premiumPriceXof.toLocaleString("fr-FR")}`,
      subtitle: "5 500 FCFA / mois",
      description: "Pour les utilisateurs réguliers qui veulent accéder à davantage de parcours et de ressources avancées.",
      features: [
        "Accès aux parcours Premium",
        "Accès élargi aux ressources",
        "Suivi avancé et historique",
        "Business Plan et documents premium",
      ],
      cta: "Passer Premium",
      highlighted: false,
    },
  ];

  return (
    <section id="tarifs" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 max-w-lg">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Modèle de prix</p>
        <h2 className="mt-3 font-display text-3xl text-ivoire">Simple, clair et orienté résultat</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.name === "À l’objectif" ? "border-or/50 bg-braise/10" : undefined}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-ivoire">{plan.name}</h3>
                {plan.name === "Premium" && <Star size={16} className="fill-or text-or" />}
              </div>
              <p className="font-display text-2xl text-or">
                {plan.price}
                {plan.name !== "Gratuit" && plan.name !== "À l’objectif" ? (
                  <span className="text-sm text-ivoire-dim"> FCFA</span>
                ) : null}
              </p>
            </div>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-or">{plan.subtitle}</p>
            <p className="mt-3 text-sm text-ivoire-dim">{plan.description}</p>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ivoire">
                  <Check size={16} className="mt-0.5 shrink-0 text-or" />
                  {feature}
                </li>
              ))}
            </ul>
            {plan.name === "Premium" ? (
              selfServeEnabled ? (
                <div className="mt-6">
                  <KkiapayCheckoutButton amountXof={premiumPriceXof} />
                </div>
              ) : (
                <div className="mt-6">
                  <Link href="/contact">
                    <Button className="w-full">
                      <Mail size={15} /> Demander un accès Premium
                    </Button>
                  </Link>
                  <p className="mt-2 text-xs text-ivoire-dim">
                    Accès sur invitation pour le moment, le temps d'une phase de test.
                  </p>
                </div>
              )
            ) : (
              <Link href="/register" className="mt-6 block">
                <Button variant={plan.name === "Gratuit" ? "secondary" : "primary"} className="w-full">
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
