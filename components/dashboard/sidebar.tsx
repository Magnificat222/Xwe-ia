import Link from "next/link";
import { dashboardNavLinks } from "@/components/dashboard/nav-links";
import { SignOutButton } from "@/components/shared/sign-out-button";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ivoire/10 bg-noir-soft/60 md:flex">
      <div className="p-6">
        <Link href="/" className="font-display text-lg text-ivoire">
          Xwé <span className="text-or">IA</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
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
      <div className="border-t border-ivoire/10 p-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
