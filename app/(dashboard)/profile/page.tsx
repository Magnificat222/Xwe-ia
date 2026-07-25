import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// TODO: hydrate from auth() session + prisma.user.findUnique(...)
const mockUser = { name: "Fide", email: "fide@example.com", plan: "FREE" as const };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Profil</p>
        <h1 className="mt-2 font-display text-3xl text-ivoire">Mon compte</h1>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg text-ivoire">{mockUser.name}</p>
            <p className="text-sm text-ivoire-dim">{mockUser.email}</p>
          </div>
          {mockUser.plan === "PREMIUM" ? (
            <Badge tone="gold">Premium</Badge>
          ) : (
            <Badge>Gratuit</Badge>
          )}
        </div>
        {mockUser.plan === "FREE" && (
          <Button size="sm">Passer Premium</Button>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-display text-lg text-ivoire">Informations</p>
        <form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
              Nom
            </label>
            <input
              defaultValue={mockUser.name}
              className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
            />
          </div>
          <Button type="submit" size="sm">Enregistrer</Button>
        </form>
      </Card>
    </div>
  );
}
