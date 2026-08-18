import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-noir">
      <header className="border-b border-ivoire/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-6">
          <Link href="/admin" className="font-display text-lg text-ivoire">
            Xwé <span className="text-or">Admin</span>
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-ivoire-dim">
            <Link href="/admin/missions" className="hover:text-ivoire">Missions</Link>
            <Link href="/admin/prompts" className="hover:text-ivoire">Prompts</Link>
            <Link href="/admin/ebooks" className="hover:text-ivoire">Ebooks</Link>
            <Link href="/admin/quiz" className="hover:text-ivoire">Quiz</Link>
            <Link href="/admin/users" className="hover:text-ivoire">Utilisateurs</Link>
            <Link href="/admin/support" className="hover:text-ivoire">Support</Link>
            <Link href="/admin/settings" className="hover:text-ivoire">Réglages</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
