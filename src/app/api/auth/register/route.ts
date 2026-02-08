import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const emailStr = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailStr || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }
    if (emailStr.length > EMAIL_MAX_LENGTH) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(emailStr)) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
      return NextResponse.json(
        { error: "La contraseña es demasiado larga" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findFirst({
      where: { email: emailStr },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: emailStr,
        password: hashed,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al registrar" },
      { status: 500 }
    );
  }
}
