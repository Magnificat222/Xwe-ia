import { Sidebar } from "@/components/dashboard/sidebar";
import { GlobalSearch } from "@/components/shared/global-search";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-noir">
      <Sidebar />
      <div className="flex-1">
        <header className="flex justify-end border-b border-ivoire/10 px-6 py-4 md:px-10">
          <GlobalSearch />
        </header>
        <main className="px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
