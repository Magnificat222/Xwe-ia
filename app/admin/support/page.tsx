import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminSupportPage() {
  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const threadsByUser = new Map<
    string,
    { user: { id: string; name: string | null; email: string }; lastMessage: string; lastAt: Date }
  >();

  for (const m of messages) {
    if (!threadsByUser.has(m.userId)) {
      threadsByUser.set(m.userId, { user: m.user, lastMessage: m.content, lastAt: m.createdAt });
    }
  }

  const threads = Array.from(threadsByUser.values());

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-ivoire">Support Premium</h1>

      {threads.length === 0 && (
        <p className="text-ivoire-dim">Aucune conversation pour l'instant.</p>
      )}

      <div className="space-y-2">
        {threads.map((thread) => (
          <Link
            key={thread.user.id}
            href={`/admin/support/${thread.user.id}`}
            className="block rounded-card border border-ivoire/10 bg-noir-soft p-4 transition-colors hover:border-or/30"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-ivoire">{thread.user.name ?? thread.user.email}</p>
              <span className="text-xs text-ivoire-dim">
                {new Date(thread.lastAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-ivoire-dim">{thread.lastMessage}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
