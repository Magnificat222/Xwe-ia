import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guards";
import { getCreditSummary } from "@/lib/credits";
import { toErrorResponse } from "@/lib/services/errors";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json(await getCreditSummary(userId));
  } catch (error) {
    return toErrorResponse(error);
  }
}
