import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { GlobalSearch } from "@/components/shared/global-search";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-noir">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ivoire/10 px-6 py-4 md:justify-end md:px-10">
          <MobileNav />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <GlobalSearch />
          </div>
        </header>
        <main className="px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
