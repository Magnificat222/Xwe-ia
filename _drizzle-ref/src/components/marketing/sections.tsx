import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Crown,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Swords,
  Wrench,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";
import { Reveal, Stagger, StaggerItem, AnimatedNumber, LiftCard } from "@/components/motion";
import { formatMinutes, formatXof, LEVEL_LABELS } from "@/lib/utils";
import type { GoalWithMeta, PathwayCard } from "@/lib/queries/catalogue";
import { resolveIcon } from "@/lib/icons";

function icon(name: string) {
  const Component = resolveIcon(name, Sparkles);
  return Component;
}

/* ------------------------------- Concept ------------------------------ */

export function ConceptSection() {
  const items = [
    {
      title: "Ce n'est pas un chatbot",
      body: "Tu n'écris pas dans le vide en espérant une bonne réponse. Tu suis un chemin pensé pour ton objectif.",
    },
    {
      title: "Ce n'est pas une liste de prompts",
      body: "Les prompts sont des outils dans les missions, pas le produit. Ce qui compte, c'est ce que tu produis.",
    },
    {
      title: "Ce n'est pas un catalogue d'outils",
      body: "Les outils IA sont recommandés au moment où tu en as besoin, pas empilés dans un annuaire.",
    },
  ];

  return (
    <section className="border-y border-ivoire/8 bg-noir-soft/40 px-5 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Le concept"
          title="Un accompagnement, pas un outil de plus"
          description="Xwé IA part de ce que tu veux accomplir et te mène jusqu'au résultat, mission après mission."
        />
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.title}>
              <Card className="h-full" tone="default">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* -------------------------------- Stats ------------------------------- */

export function StatsBar({
  stats,
}: {
  stats: { users: number; pathways: number; missions: number; results: number };
}) {
  const items = [
    { value: stats.users, label: "membres" },
    { value: stats.pathways, label: "parcours" },
    { value: stats.missions, label: "missions guidées" },
    { value: stats.results, label: "résultats produits" },
  ];
  return (
    <section className="border-y border-ivoire/8 bg-noir-soft/60 px-5 py-9 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-display text-2xl text-or sm:text-3xl">
              <AnimatedNumber value={item.value} />
            </p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-wider text-ivoire-dim">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Objectifs ----------------------------- */

export function GoalsSection({ goals }: { goals: GoalWithMeta[] }) {
  return (
    <section id="objectifs" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Par où commencer"
        title="Que veux-tu accomplir ?"
        description="Choisis ton objectif — Xwé IA te propose le parcours qui y mène."
        action={
          <Link href="/objectifs" className="shrink-0">
            <Button variant="ghost" size="sm" iconRight={<ArrowRight size={15} />}>
              Tous les objectifs
            </Button>
          </Link>
        }
      />

      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const Icon = icon(goal.icon);
          return (
            <StaggerItem key={goal.id}>
              <LiftCard>
                <Link href={`/objectifs/${goal.slug}`} className="block h-full">
                  <Card className="group flex h-full flex-col">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-or/10 text-or transition-colors group-hover:bg-or/18">
                      <Icon size={21} strokeWidth={1.6} />
                    </span>
                    <CardTitle className="text-base">{goal.title}</CardTitle>
                    <CardDescription className="flex-1">{goal.tagline}</CardDescription>
                    <p className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-ivoire-faint">
                        {goal.pathwayCount} parcours
                      </span>
                      <span className="flex items-center gap-1 text-or opacity-0 transition-opacity group-hover:opacity-100">
                        Découvrir <ArrowRight size={13} />
                      </span>
                    </p>
                  </Card>
                </Link>
              </LiftCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

/* ------------------------------- Parcours ----------------------------- */

export function PathwayCardView({ pathway }: { pathway: PathwayCard }) {
  const tone =
    pathway.accessType === "free" ? "feuillage" : pathway.accessType === "premium" ? "or" : "braise";
  return (
    <Card className="group flex h-full flex-col" interactive>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {pathway.accessType === "free" && <Badge tone="feuillage">Gratuit</Badge>}
        {pathway.accessType === "paid" && <Badge tone="braise">{formatXof(pathway.priceXof)}</Badge>}
        {pathway.accessType === "premium" && <Badge tone="or">Premium</Badge>}
        <Badge tone="outline">{LEVEL_LABELS[pathway.level]}</Badge>
      </div>

      <CardTitle className="text-base leading-snug">{pathway.title}</CardTitle>
      <CardDescription className="flex-1 line-clamp-3">{pathway.summary}</CardDescription>

      <div className="mt-4 space-y-3">
        <p className="flex items-center gap-1.5 rounded-lg bg-noir/40 px-3 py-2 text-xs text-ivoire-dim">
          <FileText size={13} className={`text-${tone}`} />
          <span className="truncate">{pathway.expectedResult}</span>
        </p>
        <div className="flex items-center justify-between text-xs text-ivoire-faint">
          <span>
            {pathway.missionCount} mission{pathway.missionCount > 1 ? "s" : ""} ·{" "}
            {formatMinutes(pathway.durationMinutes)}
          </span>
          <span className="flex items-center gap-1 text-or opacity-0 transition-opacity group-hover:opacity-100">
            Voir <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </Card>
  );
}

export function PathwaysSection({ pathways }: { pathways: PathwayCard[] }) {
  return (
    <section
      id="parcours"
      className="border-y border-ivoire/8 bg-noir-soft/40 px-5 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Les parcours"
          title="Des chemins balisés vers un résultat"
          description="Chaque parcours est une suite de missions qui produit un livrable précis."
          action={
            <Link href="/parcours" className="shrink-0">
              <Button variant="ghost" size="sm" iconRight={<ArrowRight size={15} />}>
                Tous les parcours
              </Button>
            </Link>
          }
        />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pathways.map((pathway) => (
            <StaggerItem key={pathway.id}>
              <Link href={`/parcours/${pathway.slug}`} className="block h-full">
                <PathwayCardView pathway={pathway} />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ----------------------------- Fonctionnement ------------------------- */

export function HowItWorksSection() {
  const steps = [
    { n: "01", title: "Choisis ton objectif", body: "Business, études, carrière, marketing, IA… ou décris le tien." },
    { n: "02", title: "Découvre ton parcours", body: "Xwé IA te propose la suite de missions adaptée à ton niveau." },
    { n: "03", title: "Avance mission par mission", body: "Tu réponds, tu produis. Tes réponses sont conservées." },
    { n: "04", title: "Récupère ton résultat", body: "Un document assemblé à partir de ton travail, prêt à l'usage." },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Comment ça marche"
        title="Quatre étapes, un résultat"
        description="Le même déroulé pour tous les objectifs — c'est ce qui rend l'expérience lisible."
      />
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <StaggerItem key={step.n}>
            <Card className="h-full">
              <p className="font-mono text-2xl text-or/40">{step.n}</p>
              <CardTitle className="mt-3 text-base">{step.title}</CardTitle>
              <CardDescription>{step.body}</CardDescription>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------ Modules ------------------------------- */

export function ModulesSection() {
  const modules = [
    {
      icon: Wrench,
      title: "Outils IA",
      body: "Une sélection d'outils avec leur usage concret et un mode d'emploi court.",
      href: "/outils",
      badge: "Gratuit",
    },
    {
      icon: MessageSquare,
      title: "Discussion",
      body: "Poser une question, partager une avancée, apprendre des autres membres.",
      href: "/discussion",
      badge: "Gratuit",
    },
    {
      icon: Swords,
      title: "L'Arène",
      body: "Des défis pour tester tes connaissances en IA et te mesurer aux autres.",
      href: "/arene",
      badge: "Gratuit",
    },
    {
      icon: Crown,
      title: "Premium",
      body: "L'accès à tous les parcours, y compris ceux réservés aux abonnés.",
      href: "/premium",
      badge: "Abonnement",
    },
  ];

  return (
    <section className="border-y border-ivoire/8 bg-noir-soft/40 px-5 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Au-delà des parcours"
          title="Une plateforme, plusieurs espaces"
          description="Les outils, la communauté et l'Arène restent accessibles gratuitement."
        />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((module) => (
            <StaggerItem key={module.title}>
              <LiftCard>
                <Link href={module.href} className="block h-full">
                  <Card className="group h-full">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-braise/12 text-braise-vif">
                        <module.icon size={20} strokeWidth={1.6} />
                      </span>
                      <Badge tone="outline">{module.badge}</Badge>
                    </div>
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    <CardDescription>{module.body}</CardDescription>
                  </Card>
                </Link>
              </LiftCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------ Résultats ----------------------------- */

export function ResultsSection() {
  const results = [
    "Un business plan complet",
    "Un CV professionnel",
    "Un plan marketing 30 jours",
    "Une soutenance préparée",
    "Une ligne éditoriale",
    "Une fiche projet",
    "Un assistant IA personnalisé",
    "Une grille tarifaire",
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Ce que tu obtiens"
        title="Des résultats, pas des conversations"
        description="À la fin de chaque parcours, un livrable rassemble ton travail et reste dans ton espace."
      />
      <Stagger className="mt-8 flex flex-wrap gap-2.5" stagger={0.04}>
        {results.map((result) => (
          <StaggerItem key={result}>
            <span className="inline-flex items-center gap-2 rounded-full border border-feuillage/25 bg-feuillage/8 px-3.5 py-2 text-sm text-ivoire">
              <Check size={14} className="text-feuillage-vif" />
              {result}
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------- Tarifs ------------------------------- */

export function PricingSection({
  premiumPriceXof,
  paidPathways,
  compact = false,
}: {
  premiumPriceXof: number;
  paidPathways: { title: string; priceXof: number; slug: string }[];
  compact?: boolean;
}) {
  return (
    <section
      id="tarifs"
      className={
        compact
          ? "mx-auto max-w-6xl px-5 sm:px-6"
          : "border-y border-ivoire/8 bg-noir-soft/40 px-5 py-16 sm:px-6 sm:py-20"
      }
    >
      <div className="mx-auto max-w-6xl">
        {!compact && (
          <SectionHeading
            eyebrow="Tarifs"
            title="Simple, clair, orienté résultat"
            description="Tu commences gratuitement. Tu ne paies que si tu veux un parcours précis ou l'accès complet."
          />
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <Card className="flex flex-col">
            <p className="font-display text-lg text-ivoire">Gratuit</p>
            <p className="mt-1 font-display text-3xl text-ivoire">0 <span className="text-base text-ivoire-dim">FCFA</span></p>
            <p className="mt-3 text-sm text-ivoire-dim">Pour découvrir l'approche et avancer sur tes premiers objectifs.</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {["Parcours gratuits complets", "Outils IA", "Discussion communautaire", "Arène et défis", "Tes résultats conservés"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-ivoire">
                  <Check size={15} className="mt-0.5 shrink-0 text-feuillage-vif" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription" className="mt-6">
              <Button variant="secondary" fullWidth>Créer mon compte</Button>
            </Link>
          </Card>

          <Card tone="braise" className="relative flex flex-col">
            <span className="absolute -top-3 left-6 rounded-full bg-braise px-3 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-ivoire">
              Le plus choisi
            </span>
            <p className="font-display text-lg text-ivoire">À l'objectif</p>
            <p className="mt-1 font-display text-3xl text-ivoire">
              500 – 2 500 <span className="text-base text-ivoire-dim">FCFA</span>
            </p>
            <p className="mt-3 text-sm text-ivoire-dim">
              Un achat unique pour un résultat précis. Le parcours reste accessible.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {paidPathways.slice(0, 4).map((p) => (
                <li key={p.slug} className="flex items-start justify-between gap-2 text-ivoire">
                  <span className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-braise-vif" /> {p.title}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-or">{formatXof(p.priceXof)}</span>
                </li>
              ))}
            </ul>
            <Link href="/parcours" className="mt-6">
              <Button variant="braise" fullWidth>Choisir un parcours</Button>
            </Link>
          </Card>

          <Card tone="or" className="flex flex-col">
            <p className="flex items-center gap-2 font-display text-lg text-ivoire">
              <Crown size={17} className="text-or" /> Premium
            </p>
            <p className="mt-1 font-display text-3xl text-ivoire">
              {premiumPriceXof.toLocaleString("fr-FR")} <span className="text-base text-ivoire-dim">FCFA / mois</span>
            </p>
            <p className="mt-3 text-sm text-ivoire-dim">
              Pour avancer sur plusieurs objectifs sans compter.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm">
              {["Tous les parcours, y compris payants", "Parcours réservés aux abonnés", "Ressources avancées", "Support prioritaire", "Nouveaux parcours inclus"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-ivoire">
                  <Check size={15} className="mt-0.5 shrink-0 text-or" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/premium" className="mt-6">
              <Button fullWidth>Passer Premium</Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- FAQ -------------------------------- */

export function FaqSection({
  items,
  limit,
}: {
  items: { id: string; question: string; answer: string }[];
  limit?: number;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
      <SectionHeading eyebrow="Questions fréquentes" title="Ce qu'on nous demande le plus" />
      <div className="mt-8 space-y-3">
        {shown.map((item) => (
          <Reveal key={item.id}>
            <details className="group rounded-card border border-ivoire/10 bg-noir-elevated transition-colors hover:border-or/25 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-ivoire">
                {item.question}
                <span className="shrink-0 text-or transition-transform duration-300 group-open:rotate-45">
                  <Plus size={17} />
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ivoire-dim">{item.answer}</p>
            </details>
          </Reveal>
        ))}
      </div>
      {limit && items.length > limit && (
        <div className="mt-6 text-center">
          <Link href="/faq">
            <Button variant="secondary" iconRight={<ArrowRight size={15} />}>
              Toutes les questions
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}

/* --------------------------------- CTA -------------------------------- */

export function CtaSection() {
  return (
    <section className="px-5 pb-20 sm:px-6">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-panel border border-or/20 p-8 text-center sm:p-14">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-braise) 22%, transparent), color-mix(in oklab, var(--color-feuillage) 20%, transparent))",
            }}
          />
          <div className="motif-circuit absolute inset-0 -z-10 opacity-25" aria-hidden />
          <h2 className="font-display text-2xl leading-tight text-ivoire sm:text-3xl">
            Quel est ton objectif aujourd'hui ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-ivoire-dim sm:text-base">
            Crée ton compte gratuitement et commence ton premier parcours en moins de deux minutes.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/inscription">
              <Button size="lg" iconRight={<ArrowRight size={17} />}>
                Commencer
              </Button>
            </Link>
            <Link href="/objectifs">
              <Button size="lg" variant="secondary">
                Voir les objectifs
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
