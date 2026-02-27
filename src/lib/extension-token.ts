import { randomBytes, createHmac } from "crypto";
import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

const TOKEN_BYTES = 32;
const HASH_ALGO = "sha256";
const HASH_PEPPER_SALT = "jobtracker-extension-token";

function getPepper(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is required and must be at least 16 characters to derive extension token hash"
    );
  }
  return secret;
}

export function generateExtensionToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashExtensionToken(token: string): string {
  const pepper = getPepper();
  const h = createHmac(HASH_ALGO, pepper + HASH_PEPPER_SALT);
  h.update(token, "utf8");
  return h.digest("base64");
}

/**
 * Verifica Authorization: Bearer <token> y devuelve el userId o null.
 * NO lanza si el header falta o el token es inválido.
 */
export async function verifyBearerTokenAndGetUserId(
  request: NextRequest
): Promise<string | null> {
  const auth = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1].trim();
  if (!token) return null;

  let hash: string;
  try {
    hash = hashExtensionToken(token);
  } catch (e) {
    console.error("[extension-token] hash error", e);
    return null;
  }

  const user = await prisma.user.findFirst({
    where: { extensionTokenHash: hash },
    select: { id: true },
  });
  if (!user) return null;

  // Best-effort: actualizar último uso, sin romper si falla.
  prisma.user
    .update({
      where: { id: user.id },
      data: { extensionTokenLastUsedAt: new Date() },
    })
    .catch((e) => console.error("[extension-token] lastUsedAt update error", e));

  return user.id;
}

