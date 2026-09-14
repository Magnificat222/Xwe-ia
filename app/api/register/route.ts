import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet e-mail." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // Give every new user a FREE subscription row so plan checks never hit null.
  await prisma.subscription.create({
    data: { userId: user.id, plan: "FREE", status: "ACTIVE" },
  });

  // Send a verification email — non-blocking for the account itself (the
  // person can use the site right away), it just unlocks the "verified"
  // badge/reminder dismissal. Never let an email hiccup fail signup.
  try {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: `verify:${email}`,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;
    const verifyUrl = `${baseUrl}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    await sendVerificationEmail(email, verifyUrl);
  } catch {
    // Swallow — the account still works without a verified email.
  }

  return NextResponse.json({ id: user.id, email: user.email });
}
