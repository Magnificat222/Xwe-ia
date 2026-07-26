import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [prompts, tools] = await Promise.all([
    prisma.prompt.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.tool.findMany({ select: { id: true, name: true } }),
  ]);

  const toolNameById = new Map(tools.map((t) => [t.id, t.name]));

  const enriched = prompts.map((p) => ({
    ...p,
    recommendedToolNames: p.recommendedTools
      .map((id) => toolNameById.get(id))
      .filter(Boolean) as string[],
  }));

  return NextResponse.json({ prompts: enriched });
}
