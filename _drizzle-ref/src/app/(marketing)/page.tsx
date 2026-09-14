import { Hero } from "@/components/marketing/hero";
import {
  ConceptSection,
  StatsBar,
  GoalsSection,
  PathwaysSection,
  HowItWorksSection,
  ModulesSection,
  ResultsSection,
  PricingSection,
  FaqSection,
  CtaSection,
} from "@/components/marketing/sections";
import { getGoals, getPathways, getFaq, getSettings } from "@/lib/queries/catalogue";
import { getPublicStats } from "@/lib/queries/progress";

export const revalidate = 300;

export default async function HomePage() {
  const [goals, pathways, faq, settings, stats] = await Promise.all([
    getGoals(),
    getPathways({ limit: 6 }),
    getFaq(),
    getSettings(),
    getPublicStats(),
  ]);

  const paidPathways = pathways
    .filter((p) => p.accessType === "paid")
    .map((p) => ({ title: p.title, priceXof: p.priceXof, slug: p.slug }));

  return (
    <>
      <Hero goals={goals.filter((g) => g.isFeatured)} />
      <StatsBar stats={stats} />
      <ConceptSection />
      <GoalsSection goals={goals.slice(0, 6)} />
      <PathwaysSection pathways={pathways} />
      <HowItWorksSection />
      <ModulesSection />
      <ResultsSection />
      <PricingSection premiumPriceXof={settings.premiumPriceXof} paidPathways={paidPathways} />
      <FaqSection items={faq} limit={5} />
      <CtaSection />
    </>
  );
}
