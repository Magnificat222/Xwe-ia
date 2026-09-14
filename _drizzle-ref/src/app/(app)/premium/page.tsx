import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Check, Sparkles } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading, Lisere } from "@/components/ui/misc";
import { PageTransition, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CheckoutButton } from "@/components/app/checkout";
import { getFaq } from "@/lib/queries/catalogue";
import { getPremiumBenefits } from "@/lib/queries/commerce-admin";
import { quotePremium } from "@/lib/pricing";
import { resolveIcon } from "@/lib/icons";
import { formatXof } from "@/lib/utils";
import { getSession } from "@/lib/auth/session";
import { getActiveSubscription } from "@/lib/queries/commerce";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium",
  description: "Accède à tous les parcours, tous les jeux et tous les livrables.",
};

export default async function PremiumPage() {
  // Prix et avantages viennent de la base : l'administration les pilote sans
  // qu'une ligne de code ne change.
  const [quote, session, faq, benefits] = await Promise.all([
    quotePremium(),
    getSession(),
    getFaq(),
    getPremiumBenefits(true),
  ]);
  const subscription = session ? await getActiveSubscription(session.id) : null;
  const price = quote.amountXof;
  const isPremium = session?.plan === "premium";

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-10">
      <header className="text-center">
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-or/12 text-or">
          <Crown size={30} strokeWidth={1.5} />
        </span>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-or">Xwé IA Premium</p>
        <h1 className="mt-3 font-display text-2xl leading-tight text-ivoire sm:text-3xl">
          Tout Xwé IA, sans limite
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ivoire-dim">
          Un seul abonnement pour tous les parcours, tous les outils et tous les jeux. Sans
          engagement.
        </p>
        <Lisere className="mx-auto mt-6" />
      </header>

      {isPremium && (
        <Reveal>
          <Card tone="or" className="text-center">
            <Badge tone="or">
              <Crown size={11} /> Premium actif
            </Badge>
            <CardTitle className="mt-3 text-base">Ton abonnement est actif</CardTitle>
            <CardDescription>
              {subscription?.currentPeriodEnd
                ? `Prochaine échéance le ${formatDate(subscription.currentPeriodEnd)}.`
                : "Tu as accès à l'ensemble du catalogue."}
            </CardDescription>
            <Link href="/parcours" className="mt-5 inline-block">
              <Button>Explorer les parcours</Button>
            </Link>
          </Card>
        </Reveal>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal>
          <Card className="flex h-full flex-col">
            <Badge tone="outline">Gratuit</Badge>
            <p className="mt-4 font-display text-3xl text-ivoire">
              0 <span className="text-base text-ivoire-dim">FCFA</span>
            </p>
            <p className="mt-2 text-sm text-ivoire-dim">Pour découvrir la méthode.</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {[
                "Les parcours gratuits",
                "Tes résultats et tes livrables",
                "La discussion communautaire",
                "Les outils et prompts essentiels",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ivoire-dim">
                  <Check size={15} className="mt-0.5 shrink-0 text-feuillage-vif" />
                  {item}
                </li>
              ))}
            </ul>
            {!session && (
              <Link href="/inscription" className="mt-6">
                <Button variant="secondary" fullWidth>
                  Créer mon compte
                </Button>
              </Link>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card tone="or" className="relative flex h-full flex-col">
            <span className="absolute -top-3 right-5 rounded-full bg-or px-3 py-1 text-[0.66rem] font-medium text-noir">
              Recommandé
            </span>
            <Badge tone="or">
              <Crown size={11} /> Premium
            </Badge>
            <p className="mt-4 font-display text-3xl text-ivoire">
              {price.toLocaleString("fr-FR")}{" "}
              <span className="text-base text-ivoire-dim">FCFA / mois</span>
            </p>
            {quote.isDiscounted && (
              <p className="mt-1.5 text-sm text-feuillage-vif">
                <span className="line-through opacity-60">{formatXof(quote.listPriceXof)}</span>{" "}
                {quote.promotion?.label}
              </p>
            )}
            <p className="mt-2 text-sm text-ivoire-dim">Sans engagement, résiliable à tout moment.</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit.id} className="flex items-start gap-2.5 text-sm text-ivoire-dim">
                  <Check size={15} className="mt-0.5 shrink-0 text-or" />
                  {benefit.label}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {isPremium ? (
                <Button fullWidth disabled>
                  Déjà abonné
                </Button>
              ) : session ? (
                <CheckoutButton
                  kind="premium"
                  amountXof={price}
                  listPriceXof={quote.listPriceXof}
                  label="Passer Premium"
                />
              ) : (
                <Link href="/inscription?suite=/premium">
                  <Button fullWidth icon={<Crown size={16} />}>
                    Créer mon compte
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      <section>
        <SectionHeading eyebrow="Ce que ça change" title="Concrètement, tu obtiens" />
        <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = resolveIcon(benefit.icon, Sparkles);
            return (
              <StaggerItem key={benefit.id}>
                <Card className="h-full">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-or/10 text-or">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <CardTitle className="text-sm">{benefit.label}</CardTitle>
                  <CardDescription className="text-xs">{benefit.description}</CardDescription>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <Card>
        <CardTitle className="text-base">Tu préfères payer à l'unité ?</CardTitle>
        <CardDescription>
          Chaque parcours payant est aussi disponible en achat unique. Il reste accessible
          ensuite, sans abonnement.
        </CardDescription>
        <Link href="/parcours" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Voir les parcours
          </Button>
        </Link>
      </Card>

      {faq.length > 0 && (
        <section>
          <SectionHeading eyebrow="Questions fréquentes" title="Avant de t'abonner" />
          <div className="mt-6 space-y-2.5">
            {faq.slice(0, 5).map((item) => (
              <details
                key={item.id}
                className="group rounded-card border border-ivoire/10 bg-noir-elevated px-4 py-3.5 transition-colors hover:border-or/25"
              >
                <summary className="cursor-pointer list-none text-sm text-ivoire marker:content-none">
                  <span className="flex items-center justify-between gap-3">
                    {item.question}
                    <span className="shrink-0 text-or transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ivoire-dim">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
}
