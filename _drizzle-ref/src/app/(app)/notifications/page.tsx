import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Trophy, MessageSquare, CreditCard, Megaphone, Route } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { MarkAllReadButton } from "@/components/app/actions";
import { requireUser } from "@/lib/auth/guards";
import { getNotifications } from "@/lib/queries/progress";
import { formatRelative, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

const ICONS: Record<string, typeof Bell> = {
  system: Megaphone,
  mission: Trophy,
  pathway: Route,
  discussion: MessageSquare,
  payment: CreditCard,
  arena: Trophy,
};

export default async function NotificationsPage() {
  const session = await requireUser("/notifications");
  const items = await getNotifications(session.id);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <PageTransition className="mx-auto max-w-3xl">
      <SectionHeading
        eyebrow="Ton fil"
        title="Notifications"
        description={
          unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}.` : "Tout est à jour."
        }
        action={<MarkAllReadButton disabled={unread === 0} />}
      />

      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            icon={<Bell size={22} />}
            title="Aucune notification"
            description="Tu seras prévenu quand une mission sera validée ou qu'un membre te répondra."
          />
        ) : (
          <Stagger className="space-y-2.5">
            {items.map((notification) => {
              const Icon = ICONS[notification.type] ?? Bell;
              const body = (
                <Card
                  className={cn(
                    "flex items-start gap-3.5 py-4 transition-colors",
                    !notification.readAt && "border-or/30 bg-or/[0.04]",
                  )}
                  interactive={Boolean(notification.link)}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      notification.readAt ? "bg-ivoire/6 text-ivoire-faint" : "bg-or/12 text-or",
                    )}
                  >
                    <Icon size={17} strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-ivoire">{notification.title}</p>
                      {!notification.readAt && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-braise" aria-label="Non lu" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="mt-1 text-xs leading-relaxed text-ivoire-dim">
                        {notification.body}
                      </p>
                    )}
                    <p className="mt-1.5 text-[0.7rem] text-ivoire-faint">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>
                </Card>
              );

              return (
                <StaggerItem key={notification.id}>
                  {notification.link ? <Link href={notification.link}>{body}</Link> : body}
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </PageTransition>
  );
}
