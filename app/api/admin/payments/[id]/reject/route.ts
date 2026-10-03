import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminId } from "@/lib/guards";
import { rejectPaymentRequest } from "@/lib/payments";
import { ServiceError, toErrorResponse } from "@/lib/services/errors";

const bodySchema = z.object({ reason: z.string().trim().min(3).max(300) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId();
    const { id } = await params;
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ServiceError("REASON_REQUIRED", "Indiquez un motif de refus.", 400);
    return NextResponse.json(await rejectPaymentRequest(adminId, id, parsed.data.reason));
  } catch (error) {
    return toErrorResponse(error);
  }
}
