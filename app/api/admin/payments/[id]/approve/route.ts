import { NextResponse } from "next/server";
import { requireAdminId } from "@/lib/guards";
import { approvePaymentRequest } from "@/lib/payments";
import { toErrorResponse } from "@/lib/services/errors";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = await requireAdminId();
    const { id } = await params;
    const approved = await approvePaymentRequest(adminId, id);
    return NextResponse.json({ approved: true, id: approved.id });
  } catch (error) {
    return toErrorResponse(error);
  }
}
