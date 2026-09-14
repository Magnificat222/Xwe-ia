import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";
import { Reveal } from "@/components/motion";
import { getFaq } from "@/lib/queries/catalogue";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Tout ce qu'il faut savoir sur Xwé IA : fonctionnement, tarifs, résultats, compte.",
};

export const revalidate = 3600;

export default async function FaqPage() {
  const items = await getFaq();

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Questions fréquentes"
          title="On te répond"
          description="Si tu ne trouves pas ta réponse ici, l'équipe est joignable en un message."
        />

        <div className="mt-10 space-y-10">
          {Object.entries(grouped).map(([category, entries]) => (
            <section key={category}>
              <h2 className="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-or">
                {category}
              </h2>
              <div className="space-y-2.5">
                {entries.map((item) => (
                  <details
                    key={item.id}
                    className="group rounded-card border border-ivoire/10 bg-noir-elevated px-5 py-4 transition-colors hover:border-or/25"
                  >
                    <summary className="cursor-pointer list-none marker:content-none">
                      <span className="flex items-start justify-between gap-4 text-sm text-ivoire">
                        {item.question}
                        <span
                          aria-hidden
                          className="mt-0.5 shrink-0 text-lg leading-none text-or transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3.5 text-sm leading-relaxed text-ivoire-dim">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Reveal>
          <Card className="mt-12 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-or/10 text-or">
              <LifeBuoy size={22} strokeWidth={1.6} />
            </span>
            <CardTitle className="text-base">Ta question n'est pas là ?</CardTitle>
            <CardDescription>Écris-nous, on te répond sous 24 à 48 heures.</CardDescription>
            <Link href="/support" className="mt-5 inline-block">
              <Button>Contacter le support</Button>
            </Link>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
