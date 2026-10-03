import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { getClientIp, rateLimit, rateLimitResponse, rlKey } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().min(1).max(200),
  token: z.string().min(1).max(200),
  password: resetPasswordSchema.shape.password,
});

export async function POST(request: Request) {
  const limit = await rateLimit({ key: rlKey("reset-ip", getClientIp(request)), limit: 10, windowSec: 900 });
  if (!limit.allowed) {
    return rateLimitResponse(limit, "Trop de tentatives. Réessayez dans quelques minutes.");
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    // The new password rules (8 characters minimum) were only enforced client-side.
    const issue = parsed.error.issues[0];
    const message = issue?.path[0] === "password" ? issue.message : "Requête invalide.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { email, token, password } = parsed.data;

  // One-time use, atomically: the token is claimed by a single conditional
  // DELETE. Two simultaneous requests with the same link cannot both succeed.
  const claimed = await prisma.verificationToken.deleteMany({
    where: { identifier: email, token, expires: { gt: new Date() } },
  });
  if (claimed.count === 0) {
    return NextResponse.json(
      { error: "Ce lien de réinitialisation est invalide ou expiré." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ ok: true });
}
