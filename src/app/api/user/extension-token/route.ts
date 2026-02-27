import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import {
  generateExtensionToken,
  hashExtensionToken,
} from "@/lib/extension-token";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        extensionTokenLast4: true,
        extensionTokenCreatedAt: true,
      },
    });
    if (!user?.extensionTokenLast4) {
      return NextResponse.json({ hasToken: false });
    }
    return NextResponse.json({
      hasToken: true,
      last4: user.extensionTokenLast4,
      createdAt: user.extensionTokenCreatedAt ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al consultar token" }, { status: 500 });
  }
}

/**
 * POST: rota/genera un nuevo token de extensión y lo devuelve UNA sola vez.
 * Body opcional para futuro (por ahora sin payload).
 */
export async function POST(_request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const token = generateExtensionToken();
    const hash = hashExtensionToken(token);
    const last4 = token.slice(-4);
    const now = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        extensionTokenHash: hash,
        extensionTokenLast4: last4,
        extensionTokenCreatedAt: now,
        extensionTokenLastUsedAt: null,
      },
    });

    return NextResponse.json({
      token,
      last4,
      createdAt: now,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { error: "El servidor no tiene configurado AUTH_SECRET para generar el token" },
        { status: 503 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Error al generar token" }, { status: 500 });
  }
}

/**
 * DELETE: revoca el token (lo borra).
 */
export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        extensionTokenHash: null,
        extensionTokenLast4: null,
        extensionTokenCreatedAt: null,
        extensionTokenLastUsedAt: null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al revocar token" }, { status: 500 });
  }
}

