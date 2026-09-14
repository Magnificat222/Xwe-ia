import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  let isPremium = false;
  if (session?.user?.id) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    isPremium = subscription?.plan === "PREMIUM" || session.user.role === "ADMIN";
  }

  const [prompts, tools] = await Promise.all([
    prisma.prompt.findMany({ orderBy: [{ isPremium: "asc" }, { createdAt: "desc" }] }),
    prisma.tool.findMany({ select: { id: true, name: true } }),
  ]);

  const toolNameById = new Map(tools.map((t) => [t.id, t.name]));

  const enriched = prompts.map((p) => {
    const locked = p.isPremium && !isPremium;
    return {
      ...p,
      // Never send the actual prompt text to a non-Premium user, so it
      // can't be read from the network response either.
      content: locked ? null : p.content,
      isLocked: locked,
      recommendedToolNames: p.recommendedTools
        .map((id) => toolNameById.get(id))
        .filter(Boolean) as string[],
    };
  });

  return NextResponse.json({ prompts: enriched });
}
