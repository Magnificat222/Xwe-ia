import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { getClientIp, rateLimit, rateLimitResponse, rlKey } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/app-url";

export async function POST(request: Request) {
  // Each call can send an e-mail through Resend: cap per IP.
  const ipLimit = await rateLimit({ key: rlKey("forgot-ip", getClientIp(request)), limit: 5, windowSec: 900 });
  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit, "Trop de demandes. Réessayez dans quelques minutes.");
  }

  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail requis." }, { status: 400 });
  }
  const { email } = parsed.data;

  // Per-address cap, so nobody can flood one victim's inbox from many IPs.
  // When exceeded we answer exactly like a success (no signal about the account).
  const emailLimit = await rateLimit({ key: rlKey("forgot-email", email.toLowerCase()), limit: 3, windowSec: 3600 });
  if (!emailLimit.allowed) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success, even if the user doesn't exist — this avoids
  // leaking which emails have an account (a common security practice).
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendPasswordResetEmail(email, resetUrl);

  return NextResponse.json({ ok: true });
}
