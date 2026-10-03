import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/errors";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new ServiceError("UNAUTHENTICATED", "Non authentifié.", 401);
  return session.user.id;
}

// The role stored in the JWT is frozen at login time, so a demoted admin would
// keep their rights until the token expires. For money-related actions we
// re-read the role from the database on every call.
export async function requireAdminId(): Promise<string> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") {
    throw new ServiceError("FORBIDDEN", "Accès réservé aux administrateurs.", 403);
  }
  return userId;
}
