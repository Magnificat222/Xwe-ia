import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { escapeHtml, toSingleLine } from "@/lib/html";
import { getClientIp, rateLimit, rateLimitResponse, rlKey } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

// Where bug reports and contact messages land. Set CONTACT_EMAIL in your
// environment variables (Vercel + local .env) — falls back to a clearly
// invalid placeholder so a missing config is obvious rather than silently
// emailing nobody.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "contact@example.com";

// Size limits also stop the form from being used to push huge payloads through Resend.
const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(150).nullish(),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(request: Request) {
  // Public, unauthenticated, sends a real e-mail each time: limit per IP.
  const limit = await rateLimit({ key: rlKey("contact", getClientIp(request)), limit: 5, windowSec: 3600 });
  if (!limit.allowed) {
    return rateLimitResponse(limit, "Trop de messages envoyés. Réessayez un peu plus tard.");
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Merci de remplir tous les champs." }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  // Every user-controlled value is HTML-escaped before it enters the markup.
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || "Non précisé");
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br/>");

  try {
    await resend.emails.send({
      from: "Xwé IA <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact Xwé IA] ${toSingleLine(subject) || "Nouveau message"}`,
      html: `
        <div style="font-family: sans-serif;">
          <p><strong>De :</strong> ${safeName} (${safeEmail})</p>
          <p><strong>Sujet :</strong> ${safeSubject}</p>
          <p><strong>Message :</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "L'envoi a échoué. Merci de réessayer." }, { status: 500 });
  }
}
