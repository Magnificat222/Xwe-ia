import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SupportChat } from "@/components/dashboard/support-chat";
import { ArrowLeft } from "lucide-react";

export default async function AdminSupportThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/support" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ivoire-dim hover:text-ivoire">
        <ArrowLeft size={14} /> Retour aux conversations
      </Link>
      <h1 className="mb-6 font-display text-2xl text-ivoire">{user.name ?? user.email}</h1>
      <SupportChat targetUserId={user.id} asAdmin />
    </div>
  );
}
