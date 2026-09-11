"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Target, Route, Flag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: Target, label: "Ton objectif", detail: "Tu choisis ce que tu veux accomplir." },
  { icon: Route, label: "Ton parcours", detail: "Des missions dans le bon ordre, avec le bon niveau." },
  { icon: Flag, label: "Ton résultat", detail: "Un livrable concret que tu peux utiliser." },
];

export function Hero({ goals }: { goals: { slug: string; title: string }[] }) {
  const reduce = useReducedMotion();

  return (
    <section className="halo-braise relative overflow-hidden px-5 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
        <div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-or/25 bg-or/8 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-or"
          >
            <Sparkles size={12} /> Xwé IA transforme tes idées en résultats
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 font-display text-[2rem] leading-[1.12] text-ivoire sm:text-4xl lg:text-[3.25rem]"
          >
            Une idée en tête ?<br />
            <span className="texte-braise">Transformons-la en projet.</span>
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-ivoire-dim sm:text-lg"
          >
            Xwé IA t'accompagne étape par étape pour apprendre, construire et accomplir tes
            objectifs avec l'aide de l'intelligence artificielle.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-7 flex flex-wrap gap-2"
          >
            {goals.slice(0, 5).map((goal) => (
              <Link
                key={goal.slug}
                href={`/objectifs/${goal.slug}`}
                className="rounded-full border border-ivoire/12 bg-noir-elevated/70 px-3.5 py-2 text-sm text-ivoire-dim transition-all duration-200 hover:-translate-y-0.5 hover:border-or/40 hover:text-ivoire"
              >
                {goal.title}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/inscription" className="sm:w-auto">
              <Button size="lg" fullWidth iconRight={<ArrowRight size={17} />}>
                Commencer
              </Button>
            </Link>
            <Link href="/a-propos" className="sm:w-auto">
              <Button size="lg" variant="secondary" fullWidth>
                Découvrir Xwé IA
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* La trajectoire : signature visuelle de Xwé IA. */}
        <div className="relative pl-2">
          <div className="trajectoire absolute left-[29px] top-6 h-[calc(100%-3rem)] w-px opacity-60" />
          <ul className="space-y-8">
            {steps.map((step, i) => (
              <motion.li
                key={step.label}
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.35 + i * 0.14 }}
                className="relative flex items-start gap-5"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-or/35 bg-noir-elevated text-or shadow-[0_0_24px_-10px_var(--color-or)]">
                  <step.icon size={22} strokeWidth={1.6} />
                </span>
                <div className="pt-2.5">
                  <p className="font-display text-base text-ivoire">{step.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ivoire-dim">{step.detail}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
