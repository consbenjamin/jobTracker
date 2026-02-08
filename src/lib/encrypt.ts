import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 16;
const AUTH_TAG_LEN = 16;
const SALT = "jobtracker-serpapi-key";

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is required and must be at least 16 characters for encryption");
  }
  return scryptSync(secret, SALT, KEY_LEN);
}

/**
 * Cifra un texto (p. ej. API key) para guardarlo en BD. No devolver nunca el valor cifrado al cliente.
 */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, enc]).toString("base64");
}

/**
 * Descifra un valor guardado. Usar solo en servidor.
 */
export function decrypt(encryptedBase64: string): string {
  const key = getKey();
  const buf = Buffer.from(encryptedBase64, "base64");
  if (buf.length < IV_LEN + AUTH_TAG_LEN) {
    throw new Error("Invalid encrypted value");
  }
  const iv = buf.subarray(0, IV_LEN);
  const authTag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN);
  const enc = buf.subarray(IV_LEN + AUTH_TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(enc) + decipher.final("utf8");
}
