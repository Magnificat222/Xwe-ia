import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Where bug reports and contact messages land. Set CONTACT_EMAIL in your
// environment variables (Vercel + local .env) — falls back to a clearly
// invalid placeholder so a missing config is obvious rather than silently
// emailing nobody.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "contact@example.com";

export async function POST(request: Request) {
  const { name, email, subject, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Merci de remplir tous les champs." }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Xwé IA <onboarding@resend.dev>",
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact Xwé IA] ${subject || "Nouveau message"}`,
      html: `
        <div style="font-family: sans-serif;">
          <p><strong>De :</strong> ${name} (${email})</p>
          <p><strong>Sujet :</strong> ${subject || "Non précisé"}</p>
          <p><strong>Message :</strong></p>
          <p>${String(message).replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "L'envoi a échoué. Merci de réessayer." }, { status: 500 });
  }
}
