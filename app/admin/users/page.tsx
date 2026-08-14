import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Utilisateurs</h1>
      <div className="overflow-hidden rounded-card border border-ivoire/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-noir-soft text-ivoire-dim">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ivoire-dim">
                  Aucun utilisateur inscrit pour l'instant.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="border-t border-ivoire/10 text-ivoire">
                <td className="px-4 py-3">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-ivoire-dim">{user.email}</td>
                <td className="px-4 py-3">
                  {user.subscription?.plan === "PREMIUM" ? (
                    <Badge tone="gold">Premium</Badge>
                  ) : (
                    <Badge>Gratuit</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {user.role === "ADMIN" ? <Badge tone="feuillage">Admin</Badge> : <Badge>Utilisateur</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
