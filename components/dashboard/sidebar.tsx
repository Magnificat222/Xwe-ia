import Link from "next/link";
import { dashboardNavLinks } from "@/components/dashboard/nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-ivoire/10 bg-noir-soft/60 md:block">
      <div className="p-6">
        <Link href="/" className="font-display text-lg text-ivoire">
          Xwé <span className="text-or">IA</span>
        </Link>
      </div>
      <nav className="space-y-1 px-3">
        {dashboardNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ivoire-dim transition-colors hover:bg-ivoire/5 hover:text-ivoire"
          >
            <link.icon size={18} strokeWidth={1.5} />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
