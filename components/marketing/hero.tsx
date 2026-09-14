"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Milestone, FlagTriangleRight, ArrowRight } from "lucide-react";

const trajectoire = [
  { icon: Target, label: "Objectif", detail: "Tu choisis ce que tu veux accomplir" },
  { icon: Milestone, label: "Parcours guidé", detail: "Tu avances étape par étape avec soutien" },
  { icon: FlagTriangleRight, label: "Résultat", detail: "Tu obtiens un livrable concret et utilisable" },
];

const goalExamples = [
  "Créer mon business",
  "Réussir mon projet académique",
  "Développer mon activité sur les réseaux sociaux",
  "Apprendre à utiliser l’IA",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-or">
            Xwé IA transforme tes idées en résultats concrets
          </p>
          <h1 className="font-display text-4xl leading-[1.1] text-ivoire md:text-5xl">
            Quel est ton <span className="text-or">objectif</span> ?
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ivoire-dim">
            Tu n’as pas besoin d’un autre chatbot. Tu as besoin d’un accompagnement
            qui te mène d’une idée à un résultat exploitable, étape par étape.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {goalExamples.map((goal) => (
              <span
                key={goal}
                className="rounded-full border border-or/25 bg-or/5 px-3 py-1.5 text-sm text-ivoire"
              >
                {goal}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register">
              <Button size="lg">Commencer un objectif</Button>
            </Link>
            <a href="#missions">
              <Button size="lg" variant="secondary">
                Voir les parcours <ArrowRight size={16} />
              </Button>
            </a>
          </div>
        </div>

        <div className="relative pl-4">
          <div className="trajectoire-line absolute left-[27px] top-4 h-[calc(100%-2rem)] w-px" />
          <ul className="space-y-10">
            {trajectoire.map((step, i) => (
              <motion.li
                key={step.label}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex items-start gap-5"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-or/40 bg-noir-soft text-or">
                  <step.icon size={22} strokeWidth={1.5} />
                </span>
                <div className="pt-2">
                  <p className="font-display text-lg text-ivoire">{step.label}</p>
                  <p className="text-sm text-ivoire-dim">{step.detail}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
