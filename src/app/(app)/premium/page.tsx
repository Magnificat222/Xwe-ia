import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Check, Sparkles, Swords, Wrench, FileText, Headphones, Zap } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading, Lisere } from "@/components/ui/misc";
import { PageTransition, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CheckoutButton } from "@/components/app/checkout";
import { getSettings, getFaq } from "@/lib/queries/catalogue";
import { getSession } from "@/lib/auth/session";
import { getActiveSubscription } from "@/lib/queries/commerce";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium",
  description: "Accède à tous les parcours, tous les jeux et tous les livrables.",
};

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Tous les parcours",
    detail: "L'intégralité du catalogue, y compris les parcours payants et les nouveautés.",
  },
  {
    icon: FileText,
    title: "Livrables illimités",
    detail: "Produis et télécharge autant de documents que nécessaire.",
  },
  {
    icon: Swords,
    title: "Arène complète",
    detail: "Tous les jeux, tous les défis, le classement et les duels.",
  },
  {
    icon: Wrench,
    title: "Outils et prompts",
    detail: "La bibliothèque complète de prompts et de ressources.",
  },
  {
    icon: Zap,
    title: "Nouveautés en avance",
    detail: "Les nouveaux parcours te sont ouverts dès leur publication.",
  },
  {
    icon: Headphones,
    title: "Support prioritaire",
    detail: "Tes demandes passent en tête de file.",
  },
];

export default async function PremiumPage() {
  const [settings, session, faq] = await Promise.all([getSettings(), getSession(), getFaq()]);
  const subscription = session ? await getActiveSubscription(session.id) : null;
  const price = settings?.premiumPriceXof ?? 5500;
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
            <p className="mt-2 text-sm text-ivoire-dim">Sans engagement, résiliable à tout moment.</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-2.5 text-sm text-ivoire-dim">
                  <Check size={15} className="mt-0.5 shrink-0 text-or" />
                  {benefit.title}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {isPremium ? (
                <Button fullWidth disabled>
                  Déjà abonné
                </Button>
              ) : session ? (
                <CheckoutButton kind="premium" amountXof={price} label="Passer Premium" />
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
          {BENEFITS.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <Card className="h-full">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-or/10 text-or">
                  <benefit.icon size={18} strokeWidth={1.6} />
                </span>
                <CardTitle className="text-sm">{benefit.title}</CardTitle>
                <CardDescription className="text-xs">{benefit.detail}</CardDescription>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Card>
        <CardTitle className="text-base">Tu préfères payer à l'unité ?</CardTitle>
        <CardDescription>
          Chaque parcours payant est aussi disponible en achat unique, entre 500 et 2 500 FCFA. Il
          reste accessible ensuite, sans abonnement.
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
