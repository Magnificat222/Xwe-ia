import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse, rlKey } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/app-url";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Chaque appel envoie un e-mail via Resend : 3 par heure et par compte.
  const limit = await rateLimit({ key: rlKey("resend-verification", session.user.id), limit: 3, windowSec: 3600 });
  if (!limit.allowed) {
    return rateLimitResponse(limit, "Trop de demandes. Réessayez dans un moment.");
  }

  const email = session.user.email;
  const identifier = `verify:${email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + 1000 * 60 * 60 * 24) },
  });

  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendVerificationEmail(email, verifyUrl);
  } catch {
    return NextResponse.json({ error: "L'envoi a échoué. Réessayez dans un instant." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
