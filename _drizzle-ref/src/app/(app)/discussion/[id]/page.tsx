import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock, Pin, CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, Breadcrumb } from "@/components/ui/misc";
import { PageTransition, Stagger, StaggerItem } from "@/components/motion";
import { ReplyForm, ReactionButton, ReportButton } from "@/components/app/discussion-forms";
import { getDiscussion, getUserReactions } from "@/lib/queries/community";
import { getSession } from "@/lib/auth/session";
import { formatRelative } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const topic = await getDiscussion(id);
  return { title: topic?.title ?? "Discussion" };
}

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [topic, session] = await Promise.all([getDiscussion(id), getSession()]);
  if (!topic) notFound();

  const reacted = session ? await getUserReactions(session.id) : new Set<string>();

  return (
    <PageTransition className="mx-auto max-w-3xl space-y-5">
      <Breadcrumb items={[{ label: "Discussion", href: "/discussion" }, { label: topic.title }]} />

      <Card>
        <div className="flex items-start gap-3.5">
          <Avatar name={topic.author.name} src={topic.author.avatarUrl} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {topic.isPinned && <Pin size={14} className="text-or" fill="currentColor" />}
              {topic.isLocked && <Lock size={14} className="text-ivoire-faint" />}
              <h1 className="font-display text-lg leading-snug text-ivoire">{topic.title}</h1>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ivoire-faint">
              <span>{topic.author.name}</span>
              <span>{formatRelative(topic.createdAt)}</span>
              {topic.category && <Badge tone="outline">{topic.category.name}</Badge>}
            </p>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ivoire-dim">
              {topic.body}
            </div>
          </div>
        </div>
      </Card>

      <h2 className="pt-2 font-display text-base text-ivoire">
        {topic.replies.length} réponse{topic.replies.length > 1 ? "s" : ""}
      </h2>

      <Stagger className="space-y-3">
        {topic.replies.map((reply) => (
          <StaggerItem key={reply.id}>
            <Card
              tone={reply.isAnswer ? "feuillage" : "default"}
              className="py-4"
            >
              <div className="flex items-start gap-3">
                <Avatar name={reply.author.name} src={reply.author.avatarUrl} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-xs text-ivoire-faint">
                    <span className="text-ivoire">{reply.author.name}</span>
                    <span>{formatRelative(reply.createdAt)}</span>
                    {reply.isAnswer && (
                      <Badge tone="feuillage">
                        <CheckCircle2 size={11} /> Réponse retenue
                      </Badge>
                    )}
                  </p>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ivoire-dim">
                    {reply.body}
                  </div>
                  {session && (
                    <div className="mt-3 flex items-center gap-2">
                      <ReactionButton
                        entityType="reply"
                        entityId={reply.id}
                        count={reply.reactionCount}
                        reacted={reacted.has(reply.id)}
                      />
                      <ReportButton entityType="reply" entityId={reply.id} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      {session ? (
        <ReplyForm discussionId={topic.id} locked={topic.isLocked} />
      ) : (
        <Card className="text-center">
          <CardTitle className="text-base">Rejoins la discussion</CardTitle>
          <p className="mt-2 text-sm text-ivoire-dim">
            Crée ton compte pour répondre et suivre les sujets qui t'intéressent.
          </p>
        </Card>
      )}
    </PageTransition>
  );
}
