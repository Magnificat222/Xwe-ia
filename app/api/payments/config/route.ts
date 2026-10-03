import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guards";
import { getPaymentConfig } from "@/lib/payments";
import { toErrorResponse } from "@/lib/services/errors";

export async function GET() {
  try {
    await requireUserId();
    return NextResponse.json(await getPaymentConfig());
  } catch (error) {
    return toErrorResponse(error);
  }
}
