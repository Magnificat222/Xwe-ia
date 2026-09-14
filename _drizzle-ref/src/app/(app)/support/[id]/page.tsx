import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/misc";
import { PageTransition } from "@/components/motion";
import { TicketReplyForm } from "@/components/app/support-form";
import { requireUser } from "@/lib/auth/guards";
import { getTicket } from "@/lib/queries/community";
import { formatRelative, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Demande de support" };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireUser(`/support/${id}`);
  const isStaff = session.role !== "user";
  const ticket = await getTicket(id, isStaff ? undefined : session.id);
  if (!ticket) notFound();

  return (
    <PageTransition className="mx-auto max-w-2xl space-y-5">
      <Breadcrumb items={[{ label: "Support", href: "/support" }, { label: ticket.subject }]} />

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl text-ivoire">{ticket.subject}</h1>
          <Badge tone="outline">{ticket.status}</Badge>
        </div>
        <p className="mt-1.5 text-xs text-ivoire-faint">
          Ouvert {formatRelative(ticket.createdAt)}
        </p>
      </header>

      <ul className="space-y-3">
        {ticket.messages.map((message) => {
          const fromStaff = message.senderRole === "staff";
          return (
            <li key={message.id}>
              <Card
                tone={fromStaff ? "or" : "default"}
                className={cn("py-4", fromStaff ? "" : "ml-0 sm:ml-8")}
              >
                <p className="flex items-center gap-2 text-xs">
                  <span className={fromStaff ? "text-or" : "text-ivoire"}>
                    {fromStaff ? "Équipe Xwé IA" : message.authorName}
                  </span>
                  <span className="text-ivoire-faint">{formatRelative(message.createdAt)}</span>
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ivoire-dim">
                  {message.body}
                </p>
              </Card>
            </li>
          );
        })}
      </ul>

      {ticket.status !== "closed" && <TicketReplyForm ticketId={ticket.id} />}
    </PageTransition>
  );
}
