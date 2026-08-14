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
      <div className="flex-1 rounded-tl-[2rem] bg-noir-soft md:m-2 md:ml-0">
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <MobileNav />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <GlobalSearch />
          </div>
        </header>
        <main className="px-6 pb-10 md:px-10">{children}</main>
      </div>
    </div>
  );
}
