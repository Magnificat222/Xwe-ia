import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = { title: { default: "Administration", template: "%s · Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Toute la zone est verrouillée au moins au rôle modérateur ; chaque page
  // sensible resserre ensuite l'exigence à « admin ».
  const session = await requireRole("moderator", "/admin");

  return (
    <AdminShell role={session.role} email={session.email}>
      {children}
    </AdminShell>
  );
}
