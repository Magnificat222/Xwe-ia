import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`;

  if (!token || !email) {
    return NextResponse.redirect(`${baseUrl}/profile?verify=invalid`);
  }

  const identifier = `verify:${email}`;
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.redirect(`${baseUrl}/profile?verify=expired`);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });

  return NextResponse.redirect(`${baseUrl}/profile?verify=success`);
}
