import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, ShoppingBag, Gift, ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading, Lisere } from "@/components/ui/misc";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getPathways, getFaq } from "@/lib/queries/catalogue";
import { quotePremium, quotePathways } from "@/lib/pricing";
import { getPremiumBenefits } from "@/lib/queries/commerce-admin";
import { formatXof } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Gratuit pour commencer, achat unique par parcours ou abonnement Premium.",
};

export const revalidate = 300;

export default async function PricingPage() {
  const [pathways, faq, premiumQuote, benefits] = await Promise.all([
    getPathways(),
    getFaq(),
    quotePremium(),
    getPremiumBenefits(true),
  ]);

  const free = pathways.filter((p) => p.accessType === "free");
  const paid = pathways.filter((p) => p.accessType === "paid");

  // Les prix affichés viennent du moteur de tarification, promotions comprises.
  const quotes = await quotePathways(paid.map((p) => p.id));
  const amounts = paid
    .map((p) => quotes.get(p.id)?.amountXof ?? p.priceXof)
    .filter((amount) => amount > 0);
  const min = amounts.length ? Math.min(...amounts) : 500;
  const max = amounts.length ? Math.max(...amounts) : 2500;

  // On n'annonce Premium comme « inclus » que si le catalogue payant existe.
  const premiumFeatures =
    benefits.length > 0
      ? benefits.map((b) => b.label)
      : [
          "Tous les parcours, y compris payants",
          "Tous les jeux de l'arène",
          "La bibliothèque complète de prompts",
          "Sans engagement",
        ];

  return (
    <div>
      <section className="px-5 py-14 text-center sm:px-6 sm:py-20">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-or">Tarifs</p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-ivoire sm:text-4xl">
          Un prix juste, adapté au contexte
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivoire-dim sm:text-base">
          Commence gratuitement. Paie un parcours à l'unité si tu n'en as besoin que d'un. Passe
          Premium si tu veux tout.
        </p>
        <Lisere className="mx-auto mt-8" />
      </section>

      <section className="px-5 pb-16 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
          <Reveal>
            <Card className="flex h-full flex-col">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-feuillage/12 text-feuillage-vif">
                <Gift size={20} strokeWidth={1.6} />
              </span>
              <Badge tone="feuillage">Gratuit</Badge>
              <p className="mt-4 font-display text-3xl text-ivoire">
                0 <span className="text-base text-ivoire-dim">FCFA</span>
              </p>
              <CardDescription className="mt-2">Pour découvrir la méthode.</CardDescription>
              <ul className="mt-5 flex-1 space-y-2.5">
                {[
                  `${free.length} parcours gratuits`,
                  "Tes résultats et livrables",
                  "La discussion communautaire",
                  "Les outils et prompts essentiels",
                  "L'arène en accès libre",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ivoire-dim">
                    <Check size={15} className="mt-0.5 shrink-0 text-feuillage-vif" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="mt-6">
                <Button variant="secondary" fullWidth>
                  Créer mon compte
                </Button>
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={0.07}>
            <Card tone="braise" className="flex h-full flex-col">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-braise/15 text-braise-vif">
                <ShoppingBag size={20} strokeWidth={1.6} />
              </span>
              <Badge tone="braise">Achat unique</Badge>
              <p className="mt-4 font-display text-3xl text-ivoire">
                {min.toLocaleString("fr-FR")}–{max.toLocaleString("fr-FR")}{" "}
                <span className="text-base text-ivoire-dim">FCFA</span>
              </p>
              <CardDescription className="mt-2">
                Un parcours précis, payé une seule fois.
              </CardDescription>
              <ul className="mt-5 flex-1 space-y-2.5">
                {[
                  "Accès permanent au parcours acheté",
                  "Toutes ses missions et ressources",
                  "Le livrable final téléchargeable",
                  "Paiement par Mobile Money",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ivoire-dim">
                    <Check size={15} className="mt-0.5 shrink-0 text-braise-vif" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/parcours" className="mt-6">
                <Button variant="secondary" fullWidth>
                  Voir les parcours
                </Button>
              </Link>
            </Card>
          </Reveal>

          <Reveal delay={0.14}>
            <Card tone="or" className="relative flex h-full flex-col">
              <span className="absolute -top-3 right-5 rounded-full bg-or px-3 py-1 text-[0.66rem] font-medium text-noir">
                Le meilleur rapport
              </span>
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-or/12 text-or">
                <Crown size={20} strokeWidth={1.6} />
              </span>
              <Badge tone="or">Premium</Badge>
              <p className="mt-4 font-display text-3xl text-ivoire">
                {premiumQuote.amountXof.toLocaleString("fr-FR")}{" "}
                <span className="text-base text-ivoire-dim">FCFA / mois</span>
              </p>
              {premiumQuote.isDiscounted && (
                <p className="mt-1.5 text-sm text-ivoire-faint">
                  <span className="line-through">{formatXof(premiumQuote.listPriceXof)}</span>{" "}
                  <span className="text-braise-vif">{premiumQuote.promotion?.label}</span>
                </p>
              )}
              <CardDescription className="mt-2">Tout Xwé IA, sans limite.</CardDescription>
              <ul className="mt-5 flex-1 space-y-2.5">
                {premiumFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ivoire-dim">
                    <Check size={15} className="mt-0.5 shrink-0 text-or" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/premium" className="mt-6">
                <Button fullWidth icon={<Crown size={16} />}>
                  Découvrir Premium
                </Button>
              </Link>
            </Card>
          </Reveal>
        </div>
      </section>

      {paid.length > 0 && (
        <section className="border-y border-ivoire/8 bg-noir-soft/40 px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <SectionHeading eyebrow="Détail" title="Le prix de chaque parcours payant" />
            <Stagger className="mt-7 space-y-2.5">
              {paid.map((pathway) => (
                <StaggerItem key={pathway.id}>
                  <Link href={`/parcours/${pathway.slug}`}>
                    <Card interactive className="flex items-center justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <CardTitle className="text-sm">{pathway.title}</CardTitle>
                        <p className="mt-1 truncate text-xs text-ivoire-faint">
                          {pathway.missionCount} missions · {pathway.expectedResult}
                        </p>
                      </div>
                      <span className="shrink-0 text-right">
                        {(() => {
                          const quote = quotes.get(pathway.id);
                          if (quote?.isDiscounted) {
                            return (
                              <>
                                <span className="block font-mono text-sm text-or">
                                  {formatXof(quote.amountXof)}
                                </span>
                                <span className="block font-mono text-[0.7rem] text-ivoire-faint line-through">
                                  {formatXof(quote.listPriceXof)}
                                </span>
                              </>
                            );
                          }
                          return (
                            <span className="font-mono text-sm text-or">
                              {formatXof(quote?.amountXof ?? pathway.priceXof)}
                            </span>
                          );
                        })()}
                      </span>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-6 text-center text-xs text-ivoire-faint">
              Tous ces parcours sont inclus dans l'abonnement Premium.
            </p>
          </div>
        </section>
      )}

      <section className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Paiement" title="Questions sur les tarifs" />
          <div className="mt-7 space-y-2.5">
            {faq.slice(0, 6).map((item) => (
              <details
                key={item.id}
                className="group rounded-card border border-ivoire/10 bg-noir-elevated px-5 py-4 transition-colors hover:border-or/25"
              >
                <summary className="cursor-pointer list-none marker:content-none">
                  <span className="flex items-start justify-between gap-4 text-sm text-ivoire">
                    {item.question}
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 text-lg leading-none text-or transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3.5 text-sm leading-relaxed text-ivoire-dim">{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/inscription">
              <Button size="lg" iconRight={<ArrowRight size={17} />}>
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
