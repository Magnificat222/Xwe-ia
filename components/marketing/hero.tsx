"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Milestone, FlagTriangleRight } from "lucide-react";

const trajectoire = [
  { icon: Target, label: "Objectif", detail: "Vous choisissez un résultat concret" },
  { icon: Milestone, label: "Missions guidées", detail: "L'IA vous accompagne étape par étape" },
  { icon: FlagTriangleRight, label: "Résultat", detail: "Un livrable réel, prêt à l'emploi" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-28">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-or">
            L'IA orientée objectifs
          </p>
          <h1 className="font-display text-4xl leading-[1.1] text-ivoire md:text-5xl">
            Vous n'avez pas besoin d'un{" "}
            <em className="text-ivoire-dim not-italic">autre chatbot</em>.
            <br />
            Vous avez besoin d'arriver <span className="text-or">au résultat</span>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ivoire-dim">
            Xwé IA transforme un objectif — business plan, lancement
            d'entreprise, soutenance, personal branding — en missions guidées,
            avec les prompts et les outils IA qu'il faut à chaque étape.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register">
              <Button size="lg">Choisir mon objectif</Button>
            </Link>
            <a href="#missions">
              <Button size="lg" variant="secondary">Voir les missions</Button>
            </a>
          </div>
        </div>

        {/* Signature element: la trajectoire */}
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
