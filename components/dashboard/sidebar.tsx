"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { dashboardNavLinks } from "@/components/dashboard/nav-links";
import { SignOutButton } from "@/components/shared/sign-out-button";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-noir md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Image
          src="/logo-xwe-ia.png"
          alt=""
          width={30}
          height={30}
          className="rounded-full"
        />
        <span className="font-display text-lg tracking-tight text-ivoire">
          Xwé <span className="text-or">IA</span>
        </span>
      </div>

      <div className="liseré mx-6 mb-2" />

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {dashboardNavLinks.map((link) => {
          const active = link.href === "/dashboard" ? pathname === link.href : pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-braise/12 text-ivoire"
                  : "text-ivoire-dim hover:bg-ivoire/5 hover:text-ivoire"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-braise" />
              )}
              <link.icon size={18} strokeWidth={1.5} className={active ? "text-or" : ""} />
              {link.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-or transition-colors hover:bg-or/10"
          >
            <ShieldCheck size={18} strokeWidth={1.5} />
            Administration
          </Link>
        )}
      </nav>

      <div className="border-t border-ivoire/8 p-3">
        <SignOutButton />
      </div>
    </aside>
  );
}
