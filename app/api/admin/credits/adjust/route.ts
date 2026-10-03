import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminId } from "@/lib/guards";
import { adminAdjustCredits } from "@/lib/credits";
import { ServiceError, toErrorResponse } from "@/lib/services/errors";

const bodySchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().refine((n) => n !== 0, "Montant nul.").refine((n) => Math.abs(n) <= 100000, "Montant trop élevé."),
  reason: z.string().trim().min(5).max(300),
});

export async function POST(request: Request) {
  try {
    const adminId = await requireAdminId();
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ServiceError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "Données invalides.", 400);
    }
    const ledger = await adminAdjustCredits({ adminId, ...parsed.data });
    return NextResponse.json({ ok: true, balance: ledger.balanceAfter });
  } catch (error) {
    return toErrorResponse(error);
  }
}
