import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guards";
import {
  createPaymentRequest,
  createPaymentRequestSchema,
  listUserPaymentRequests,
} from "@/lib/payments";
import { ServiceError, toErrorResponse } from "@/lib/services/errors";
import { enforceRateLimit, rlKey } from "@/lib/rate-limit";

export async function GET() {
  try {
    const userId = await requireUserId();
    return NextResponse.json({ requests: await listUserPaymentRequests(userId) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    await enforceRateLimit({ key: rlKey("payment-request", userId), limit: 10, windowSec: 3600 });
    const body = await request.json().catch(() => null);
    const parsed = createPaymentRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ServiceError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "Données invalides.", 400);
    }
    const created = await createPaymentRequest(userId, parsed.data);
    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
