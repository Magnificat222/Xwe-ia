import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guards";
import { unlockPathWithCredits } from "@/lib/path-access";
import { toErrorResponse } from "@/lib/services/errors";

// The body is ignored on purpose: the price comes from the database.
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const userId = await requireUserId();
    const { slug } = await params;
    return NextResponse.json(await unlockPathWithCredits(userId, slug));
  } catch (error) {
    return toErrorResponse(error);
  }
}
