import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rlKey } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials, request) => {
        if (!credentials?.email || !credentials?.password) return null;

        // Brute-force brake. The per-account key includes the IP, so an
        // attacker cannot lock a victim out from another connection; the
        // IP-only key slows credential stuffing across many accounts.
        // Over the limit => same generic "invalid credentials" outcome.
        const ip = getClientIp(request);
        const emailKey = String(credentials.email).trim().toLowerCase();
        const [byIp, byAccount] = await Promise.all([
          rateLimit({ key: rlKey("login-ip", ip), limit: 30, windowSec: 900 }),
          rateLimit({ key: rlKey("login-account", ip, emailKey), limit: 8, windowSec: 900 }),
        ]);
        if (!byIp.allowed || !byAccount.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        // Deliberately NOT returning `image` here: it can be a large base64
        // data URL (profile pictures are stored inline in the DB), and
        // next-auth embeds everything `authorize` returns into the JWT
        // session cookie. A multi-hundred-KB cookie blows past browsers'
        // and Vercel's header-size limits and breaks every request with
        // REQUEST_HEADER_TOO_LARGE. Anywhere the avatar is needed, it's
        // fetched fresh from the database instead (see /profile).
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    // TODO: add Google / GitHub OAuth providers once client IDs are issued.
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },
  },
});
