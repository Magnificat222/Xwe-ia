import type { Metadata } from "next";
import { Crown, ShieldCheck, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, SectionHeading } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion";
import { DataTable, type Column } from "@/components/admin/data-table";
import { UserRowActions } from "@/components/admin/user-actions";
import { requireRole, hasRole } from "@/lib/auth/guards";
import { getAdminUsers } from "@/lib/queries/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilisateurs" };

const ROLE_LABELS: Record<string, string> = {
  user: "Utilisateur",
  moderator: "Modérateur",
  admin: "Administrateur",
  super_admin: "Super admin",
};

type Row = Awaited<ReturnType<typeof getAdminUsers>>[number];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const admin = await requireRole("moderator", "/admin/utilisateurs");
  const { q, role } = await searchParams;
  const users = await getAdminUsers({ q, role });
  const canManageRoles = hasRole(admin, "admin");

  const columns: Column<Row>[] = [
    {
      key: "user",
      header: "Membre",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.displayName ?? row.name ?? row.email} src={row.avatarUrl} size={32} />
          <div className="min-w-0">
            <p className="truncate text-ivoire">{row.displayName ?? row.name ?? "—"}</p>
            <p className="truncate text-xs text-ivoire-faint">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (row) =>
        row.role === "user" ? (
          <span className="text-xs text-ivoire-faint">Utilisateur</span>
        ) : (
          <Badge tone="braise">
            <ShieldCheck size={11} /> {ROLE_LABELS[row.role]}
          </Badge>
        ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (row) =>
        row.plan === "premium" ? (
          <Badge tone="or">
            <Crown size={11} /> Premium
          </Badge>
        ) : (
          <span className="text-xs text-ivoire-faint">Gratuit</span>
        ),
    },
    {
      key: "status",
      header: "Statut",
      render: (row) =>
        row.isBanned ? (
          <Badge tone="erreur">
            <Ban size={11} /> Suspendu
          </Badge>
        ) : row.deletedAt ? (
          <Badge tone="outline">Supprimé</Badge>
        ) : (
          <Badge tone="feuillage">Actif</Badge>
        ),
    },
    {
      key: "createdAt",
      header: "Inscription",
      secondary: true,
      render: (row) => <span className="text-xs">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <UserRowActions
          userId={row.id}
          role={row.role}
          isBanned={row.isBanned}
          isPremium={row.plan === "premium"}
          canManageRoles={canManageRoles}
        />
      ),
    },
  ];

  return (
    <PageTransition className="mx-auto max-w-6xl space-y-6">
      <SectionHeading
        eyebrow="Communauté"
        title="Utilisateurs"
        description={`${users.length} compte${users.length > 1 ? "s" : ""} affiché${users.length > 1 ? "s" : ""}.`}
      />

      <form action="/admin/utilisateurs" className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par e-mail ou nom…"
          aria-label="Rechercher un utilisateur"
          className="w-full rounded-xl border border-ivoire/15 bg-noir px-4 py-3 text-sm text-ivoire placeholder:text-ivoire-faint outline-none focus:border-or/60"
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          aria-label="Filtrer par rôle"
          className="rounded-xl border border-ivoire/15 bg-noir px-4 py-3 text-sm text-ivoire outline-none focus:border-or/60"
        >
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrer
        </Button>
      </form>

      <DataTable
        columns={columns}
        rows={users}
        empty="Aucun utilisateur ne correspond."
        title={(row) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.displayName ?? row.email} src={row.avatarUrl} size={34} />
            <div className="min-w-0">
              <p className="truncate text-ivoire">{row.displayName ?? row.name ?? "—"}</p>
              <p className="truncate text-xs text-ivoire-faint">{row.email}</p>
            </div>
          </div>
        )}
      />
    </PageTransition>
  );
}
