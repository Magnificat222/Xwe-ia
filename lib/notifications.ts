import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function notify(
  userId: string,
  type: NotificationType,
  message: string,
  link: string
) {
  try {
    await prisma.notification.create({ data: { userId, type, message, link } });
  } catch {
    // Notifications are a nice-to-have — never let a failure here break
    // the action that triggered it (sending a message, creating a duel...).
  }
}
