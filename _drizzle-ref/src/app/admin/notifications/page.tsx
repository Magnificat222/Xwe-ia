import type { Metadata } from "next";
import { Bell, Send, Users, Crown } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { requireRole } from "@/lib/auth/guards";
import { getBroadcastHistory, getNotificationStats } from "@/lib/queries/commerce-admin";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await requireRole("admin", "/admin/notifications");

  const [stats, history] = await Promise.all([getNotificationStats(), getBroadcastHistory()]);

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-7">
      <SectionHeading
        eyebrow="Communauté"
        title="Notifications"
        description="Une annonce arrive dans la cloche de chaque membre. Réserve-la aux informations utiles."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Membres actifs" value={stats.activeUsers} icon={<Users size={18} />} tone="or" />
        <Stat label="Abonnés Premium" value={stats.premiumUsers} icon={<Crown size={18} />} tone="braise" />
        <Stat label="Envoyées (30 j)" value={stats.sentMonth} icon={<Send size={18} />} tone="feuillage" />
        <Stat label="Taux de lecture" value={`${stats.readRate.toFixed(0)} %`} icon={<Bell size={18} />} tone="or" />
      </div>

      <BroadcastForm totalUsers={stats.activeUsers} premiumUsers={stats.premiumUsers} />

      <section>
        <h2 className="mb-4 font-display text-lg text-ivoire">Annonces envoyées</h2>
        {history.length === 0 ? (
          <Card>
            <p className="text-sm text-ivoire-dim">Aucune annonce pour l'instant.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((row) => (
              <Card key={`${row.title}-${row.createdAt.toISOString()}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm">{row.title}</CardTitle>
                    <p className="mt-1 text-xs leading-relaxed text-ivoire-dim">{row.body}</p>
                    {row.link && (
                      <p className="mt-1.5 font-mono text-[0.7rem] text-or">{row.link}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone="outline">
                      {row.recipients} destinataire{row.recipients > 1 ? "s" : ""}
                    </Badge>
                    <p className="mt-1.5 text-[0.7rem] text-ivoire-faint">
                      {formatRelative(row.createdAt)}
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-feuillage-vif">{row.readCount} lue{row.readCount > 1 ? "s" : ""}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}
