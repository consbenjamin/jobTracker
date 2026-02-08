import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET?.trim()) {
  throw new Error("AUTH_SECRET es obligatorio en producción. Genera uno con: openssl rand -base64 32");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: { email },
        });
        if (!user || !user.password) return null;
        const { default: bcrypt } = await import("bcryptjs");
        const ok = await bcrypt.compare(String(credentials.password), user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub ?? "";
      return session;
    },
    redirect({ url, baseUrl }) {
      const u = typeof url === "string" ? url.trim() : "";
      if (!u || u === "[]" || u === "null" || u === "undefined") return baseUrl;
      // Rechazar URLs con "[]" en la ruta (bug conocido con algunos providers, ej. GitHub)
      if (u.includes("[]")) return baseUrl;
      if (u.startsWith("/") && !u.startsWith("//")) {
        const path = u;
        if (path === "[]" || path.startsWith("[]") || path === "/[]") return baseUrl;
        return `${baseUrl}${path}`;
      }
      try {
        const parsed = new URL(u);
        if (parsed.origin !== new URL(baseUrl).origin) return baseUrl;
        if (parsed.pathname === "" || parsed.pathname === "[]" || parsed.pathname === "/[]") return baseUrl;
        return u;
      } catch {
        return baseUrl;
      }
    },
  },
});

/** Devuelve el userId de la sesión o null si no hay usuario. Útil en API routes. */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Devuelve el userId o lanza Response 401. Usar en API routes. */
export async function requireAuth(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  return userId;
}
