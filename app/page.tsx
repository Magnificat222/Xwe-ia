import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { PathsShowcase } from "@/components/marketing/paths-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { Footer } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CategoryGrid />
      <PathsShowcase />
      <PricingSection />
      <Footer />
    </main>
  );
}
