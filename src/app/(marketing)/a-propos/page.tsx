import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Target, Route, Trophy, Users, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading, Lisere, Stat } from "@/components/ui/misc";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getPublicStats } from "@/lib/queries/progress";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Xwé IA transforme tes idées en résultats concrets, étape par étape, avec l'aide de l'intelligence artificielle.",
};

export const revalidate = 3600;

const PRINCIPLES = [
  {
    icon: Target,
    title: "On part de ton objectif",
    detail:
      "Pas d'un outil, pas d'une fonctionnalité. La première question de Xwé IA est toujours : que veux-tu accomplir ?",
  },
  {
    icon: Route,
    title: "On balise le chemin",
    detail:
      "Un objectif se décompose en parcours, un parcours en missions. Tu sais toujours où tu en es et ce qui vient ensuite.",
  },
  {
    icon: Trophy,
    title: "On termine par un résultat",
    detail:
      "Chaque mission produit quelque chose de réel : un document, un plan, une décision. Pas juste une leçon lue.",
  },
  {
    icon: Sparkles,
    title: "L'IA sert, elle ne remplace pas",
    detail:
      "Elle t'aide à formuler, structurer, accélérer. Le travail et les décisions restent les tiens.",
  },
];

export default async function AboutPage() {
  const stats = await getPublicStats();

  return (
    <div>
      <section className="relative overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
        <div className="halo-braise pointer-events-none absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-or">
            À propos de Xwé IA
          </p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-ivoire sm:text-4xl">
            Transformer une idée en résultat concret
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivoire-dim">
            Xwé IA t'accompagne étape par étape pour apprendre, construire et accomplir tes
            objectifs avec l'aide de l'intelligence artificielle.
          </p>
          <Lisere className="mx-auto mt-8" />
        </div>
      </section>

      <section className="border-y border-ivoire/8 bg-noir-soft/40 px-5 py-14 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Membres" value={stats.users} tone="or" />
          <Stat label="Parcours" value={stats.pathways} tone="braise" />
          <Stat label="Missions" value={stats.missions} tone="feuillage" />
          <Stat label="Résultats produits" value={stats.results} tone="or" />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="Pourquoi Xwé IA" title="Le problème qu'on résout" />
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ivoire-dim sm:text-base">
            <p>
              L'intelligence artificielle est partout, et pourtant beaucoup de gens restent devant
              une page blanche. Le problème n'est pas l'accès aux outils : c'est de savoir quoi
              faire, dans quel ordre, et jusqu'où aller.
            </p>
            <p>
              Xwé IA n'est ni un clone de ChatGPT, ni une bibliothèque de prompts, ni un catalogue
              d'outils de plus. C'est une méthode : tu choisis un objectif, on te donne le parcours,
              tu avances mission par mission, et tu repars avec un livrable que tu peux utiliser.
            </p>
            <p className="texte-braise font-display text-lg">
              Objectif → Parcours → Missions → Progression → Production → Livrable → Résultat.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-ivoire/8 bg-noir-soft/40 px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Nos principes"
            title="Ce qui guide chaque décision produit"
          />
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <StaggerItem key={principle.title}>
                <Card className="h-full">
                  <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-or/10 text-or">
                    <principle.icon size={20} strokeWidth={1.6} />
                  </span>
                  <CardTitle className="text-base">{principle.title}</CardTitle>
                  <CardDescription>{principle.detail}</CardDescription>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="L'équipe" title="Derrière Xwé IA" />
          <Reveal>
            <Card className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-start">
              <Image
                src="/magni-portrait.jpg"
                alt="Portrait du fondateur de Xwé IA"
                width={112}
                height={112}
                className="h-28 w-28 shrink-0 rounded-2xl object-cover"
              />
              <div>
                <CardTitle className="text-base">Une initiative béninoise</CardTitle>
                <CardDescription>
                  Xwé IA est né du constat que l'IA change la donne pour celles et ceux qui
                  entreprennent, étudient ou se forment — à condition d'avoir une méthode. Le
                  produit est pensé depuis l'Afrique de l'Ouest, avec des tarifs et des moyens de
                  paiement adaptés au contexte local.
                </CardDescription>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Card tone="braise" className="text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-braise/15 text-braise-vif">
              <Users size={22} />
            </span>
            <CardTitle className="text-lg">Une idée en tête ?</CardTitle>
            <CardDescription>Transformons-la en projet, dès aujourd'hui.</CardDescription>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
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
          </Card>
        </div>
      </section>
    </div>
  );
}
