import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { SupportForm } from "@/components/app/support-form";
import { getSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/queries/catalogue";
import { getUserTickets } from "@/lib/queries/community";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Support",
  description: "Une question, un problème ? L'équipe Xwé IA te répond.",
};

const STATUS_LABELS: Record<string, { label: string; tone: "or" | "feuillage" | "outline" }> = {
  open: { label: "Ouvert", tone: "or" },
  pending: { label: "Réponse reçue", tone: "feuillage" },
  closed: { label: "Fermé", tone: "outline" },
};

export default async function SupportPage() {
  const session = await getSession();
  const [settings, tickets] = await Promise.all([
    getSettings(),
    session ? getUserTickets(session.id) : Promise.resolve([]),
  ]);

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-7">
      <SectionHeading
        eyebrow="On est là"
        title="Support"
        description="Décris ton problème le plus précisément possible : on te répond rapidement."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/faq">
          <Card interactive className="flex h-full items-center gap-3.5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-or/10 text-or">
              <BookOpen size={18} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ivoire">Consulter la FAQ</p>
              <p className="text-xs text-ivoire-faint">La réponse y est peut-être déjà.</p>
            </div>
            <ChevronRight size={15} className="ml-auto shrink-0 text-ivoire-faint" />
          </Card>
        </Link>
        <Link href="/discussion">
          <Card interactive className="flex h-full items-center gap-3.5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-feuillage/12 text-feuillage-vif">
              <MessageSquare size={18} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ivoire">Demander à la communauté</p>
              <p className="text-xs text-ivoire-faint">Souvent la voie la plus rapide.</p>
            </div>
            <ChevronRight size={15} className="ml-auto shrink-0 text-ivoire-faint" />
          </Card>
        </Link>
      </div>

      {tickets.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg text-ivoire">Tes demandes</h2>
          <Card className="p-0">
            <ul>
              {tickets.map((ticket) => {
                const status = STATUS_LABELS[ticket.status] ?? STATUS_LABELS.open;
                return (
                  <li key={ticket.id}>
                    <Link
                      href={`/support/${ticket.id}`}
                      className="flex items-center gap-3 border-b border-ivoire/6 px-4 py-3.5 transition-colors last:border-0 hover:bg-ivoire/4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ivoire">{ticket.subject}</p>
                        <p className="text-xs text-ivoire-faint">
                          {formatRelative(ticket.updatedAt)}
                        </p>
                      </div>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}

      <SupportForm defaultEmail={session?.email ?? ""} />

      <Card className="flex items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ivoire/6 text-or">
          <Mail size={18} strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <CardTitle className="text-sm">Par e-mail</CardTitle>
          <CardDescription className="text-xs">
            <a
              href={`mailto:${settings?.supportEmail ?? "contact@xwe-ia.com"}`}
              className="text-or hover:underline"
            >
              {settings?.supportEmail ?? "contact@xwe-ia.com"}
            </a>
          </CardDescription>
        </div>
      </Card>
    </PageTransition>
  );
}
