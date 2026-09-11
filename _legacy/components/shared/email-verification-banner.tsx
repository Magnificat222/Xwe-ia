import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";
import { ResendVerificationButton } from "@/components/shared/resend-verification-button";

export async function EmailVerificationBanner() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Read fresh from the DB rather than the session/JWT — keeping the
  // session cookie minimal is a hard rule here after the profile-picture
  // incident (a bloated cookie broke every request site-wide).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });

  if (!user || user.emailVerified) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-or/25 bg-or/5 px-4 py-3">
      <p className="flex items-center gap-2 text-sm text-ivoire">
        <AlertTriangle size={15} className="shrink-0 text-or" />
        Confirmez votre adresse e-mail pour sécuriser votre compte.
      </p>
      <ResendVerificationButton />
    </div>
  );
}
