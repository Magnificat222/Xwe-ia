import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ prompts });
}
