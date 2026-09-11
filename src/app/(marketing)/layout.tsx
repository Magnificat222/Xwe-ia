import { MarketingHeader } from "@/components/layout/marketing-header";
import { Footer } from "@/components/layout/footer";
import { getSession } from "@/lib/auth/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader isAuthenticated={Boolean(session)} />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
