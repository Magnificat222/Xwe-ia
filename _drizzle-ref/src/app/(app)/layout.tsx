import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileTabBar, MobileDrawer, NotificationBell } from "@/components/layout/mobile-nav";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Footer } from "@/components/layout/footer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/layout/brand";
import { getSession } from "@/lib/auth/session";
import { getUnreadCount } from "@/lib/queries/progress";

/**
 * Coquille applicative adaptative.
 *
 * Les pages de catalogue (parcours, objectifs, outils…) sont consultables sans
 * compte : on leur sert alors l'en-tête public. Dès qu'une session existe, la
 * même page bascule dans l'espace membre (barre latérale sur desktop, barre
 * d'onglets sur mobile) sans changer d'URL ni dupliquer les pages.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <MarketingHeader isAuthenticated={false} />
        <main id="contenu" className="flex-1 px-5 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  const unread = await getUnreadCount(session.id);
  const user = {
    name: session.displayName || session.name || session.email,
    email: session.email,
    role: session.role,
    plan: session.plan,
    avatarUrl: session.avatarUrl,
  };

  return (
    <div className="flex min-h-screen bg-noir">
      <AppSidebar user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ivoire/8 bg-noir/85 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <MobileDrawer user={user} unread={unread} />
            <span className="lg:hidden">
              <Logo size={26} />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <NotificationBell unread={unread} />
          </div>
        </header>

        <main
          id="contenu"
          className="safe-bottom flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12"
        >
          {children}
        </main>
      </div>

      <MobileTabBar unread={unread} />
    </div>
  );
}
