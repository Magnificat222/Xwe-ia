"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, profiles, subscriptions, notifications, verificationTokens, sessions } from "@/db/schema";
import { createSession, destroySession, destroyAllSessions, hashToken } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/guards";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validations";

export type ActionState = { error?: string; success?: string; fieldErrors?: Record<string, string> };

/** Anti force brute simple, en mémoire. À remplacer par Redis en production. */
const attempts = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

async function requestMeta() {
  const h = await headers();
  return {
    userAgent: h.get("user-agent") ?? undefined,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
  };
}

/**
 * N'accepte qu'un chemin interne : empêche `?suite=https://…` de transformer
 * la redirection post-connexion en redirection ouverte.
 */
function safeSuite(value: FormDataEntryValue | null): string | null {
  const suite = String(value ?? "");
  return suite.startsWith("/") && !suite.startsWith("//") ? suite : null;
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    return { fieldErrors: { email: "Un compte existe déjà avec cette adresse." } };
  }

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await bcrypt.hash(password, 12) })
    .returning({ id: users.id });

  await db.insert(profiles).values({ userId: user.id, displayName: name });
  await db.insert(subscriptions).values({ userId: user.id, plan: "free", status: "active" });
  await db.insert(notifications).values({
    userId: user.id,
    type: "system",
    title: "Bienvenue sur Xwé IA",
    body: "Commence par choisir un objectif : on te propose ensuite le parcours adapté.",
    link: "/objectifs",
  });

  await createSession(user.id, await requestMeta());

  // On passe par l'onboarding, mais sans perdre la page que la personne
  // voulait atteindre : elle y sera renvoyée à la fin (ou si elle passe).
  const suite = safeSuite(formData.get("suite"));
  redirect(suite ? `/bienvenue?suite=${encodeURIComponent(suite)}` : "/bienvenue");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Identifiants invalides." };

  const { email, password } = parsed.data;
  if (!rateLimit(`login:${email}`)) {
    return { error: "Trop de tentatives. Réessaie dans une minute." };
  }

  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);
  const user = rows[0];

  // Message identique dans les deux cas : on n'indique pas si le compte existe.
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "E-mail ou mot de passe incorrect." };
  }
  if (user.isBanned) return { error: "Ce compte a été suspendu." };

  await createSession(user.id, await requestMeta());
  await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, user.id));

  redirect(safeSuite(formData.get("suite")) ?? (user.onboardedAt ? "/tableau-de-bord" : "/bienvenue"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Adresse e-mail invalide." };

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (rows[0]) {
    const token = randomBytes(32).toString("hex");
    await db.insert(verificationTokens).values({
      identifier: parsed.data.email,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      purpose: "password_reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    // L'envoi d'e-mail réel est câblé dans le Prompt 2 (Resend).
    // En développement, le lien est affiché dans les logs serveur.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[reset] /reinitialiser?token=${token}`);
    }
  }

  // Réponse identique que le compte existe ou non (anti-énumération).
  return { success: "Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé." };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const rows = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.tokenHash, tokenHash),
        eq(verificationTokens.purpose, "password_reset"),
        gt(verificationTokens.expiresAt, new Date()),
        isNull(verificationTokens.usedAt),
      ),
    )
    .limit(1);

  const record = rows[0];
  if (!record) return { error: "Ce lien est invalide ou expiré." };

  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, record.identifier))
    .limit(1);
  if (!userRows[0]) return { error: "Ce lien est invalide ou expiré." };

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.password, 12) })
    .where(eq(users.id, userRows[0].id));
  await db
    .update(verificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(verificationTokens.id, record.id));

  // Toute session ouverte est révoquée : si le compte était compromis,
  // l'attaquant est déconnecté immédiatement.
  await destroyAllSessions(userRows[0].id);

  redirect("/connexion?reinitialise=1");
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const rows = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  if (!rows[0]?.passwordHash || !(await bcrypt.compare(parsed.data.current, rows[0].passwordHash))) {
    return { fieldErrors: { current: "Mot de passe actuel incorrect." } };
  }

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.password, 12) })
    .where(eq(users.id, session.id));

  revalidatePath("/parametres");
  return { success: "Mot de passe mis à jour." };
}

export async function deleteAccountAction(): Promise<void> {
  const session = await requireUser();
  // La cascade des clés étrangères efface profil, réponses, résultats,
  // favoris, notifications et sessions.
  await db.delete(users).where(eq(users.id, session.id));
  await destroySession();
  redirect("/?compte-supprime=1");
}

export async function revokeOtherSessionsAction(): Promise<ActionState> {
  const session = await requireUser();
  const h = await headers();
  const cookieHeader = h.get("cookie") ?? "";
  const match = cookieHeader.match(/xwe_session=([^;]+)/);
  const currentHash = match ? hashToken(match[1]) : null;

  const all = await db.select().from(sessions).where(eq(sessions.userId, session.id));
  for (const s of all) {
    if (s.tokenHash !== currentHash) await db.delete(sessions).where(eq(sessions.id, s.id));
  }
  return { success: "Les autres sessions ont été déconnectées." };
}
