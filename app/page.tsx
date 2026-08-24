import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { PathsShowcase } from "@/components/marketing/paths-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Footer } from "@/components/marketing/footer";
import { IntroSplash } from "@/components/marketing/intro-splash";
import { getSiteSettings } from "@/lib/settings";

export default async function LandingPage() {
  const settings = await getSiteSettings();

  return (
    <main>
      <IntroSplash />
      <Navbar />
      <Hero />
      <StatsBar />
      <CategoryGrid />
      <PathsShowcase />
      <PricingSection premiumPriceXof={settings.premiumPriceXof} />
      <Footer />
    </main>
  );
}
