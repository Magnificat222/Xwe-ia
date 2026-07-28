import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await resend.emails.send({
    // "onboarding@resend.dev" works out of the box without a verified domain.
    // Once you verify your own domain on Resend, replace this with e.g.
    // "Xwé IA <noreply@xwe-ia.com>".
    from: "Xwé IA <onboarding@resend.dev>",
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur Xwé IA.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      </div>
    `,
  });
}
