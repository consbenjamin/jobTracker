import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

const SAFE_CALLBACK = "/";

function isValidRedirectUrl(url: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const u = url.trim();
  if (u === "" || u === "[]" || u === "null" || u === "undefined") return false;
  if (u.startsWith("/") && !u.startsWith("//")) return true;
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function buildRedirectToHome(req: Request, res: Response): Response {
  const base = new URL(req.url).origin;
  const redirect = Response.redirect(`${base}${SAFE_CALLBACK}`, 302);
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") redirect.headers.append("Set-Cookie", value);
  });
  redirect.headers.append("Set-Cookie", "authjs.callback-url=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
  return redirect;
}

async function wrapHandler(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  const res = await handler(req);
  const base = new URL(req.url).origin;
  const status = res.status;
  const isCallback = req.url.includes("/callback/");

  if (status === 302 || status === 303 || status === 307) {
    const loc = res.headers.get("Location");
    if (!isValidRedirectUrl(loc)) {
      return buildRedirectToHome(req, res);
    }
  }

  if (status === 200 && isCallback) {
    let body: string | null = null;
    try {
      body = await res.clone().text();
    } catch {
      return res;
    }
    if (body === "[]" || body?.trim() === "[]") {
      return buildRedirectToHome(req, res);
    }
    try {
      const data = JSON.parse(body);
      if (Array.isArray(data) && data.length === 0) {
        return buildRedirectToHome(req, res);
      }
      if (data?.url && !isValidRedirectUrl(data.url)) {
        const out = Response.json({ url: `${base}${SAFE_CALLBACK}` }, { status: 200, headers: res.headers });
        return out;
      }
    } catch {
      // not json
    }
  }

  if (status === 200 && !isCallback) {
    const contentType = res.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const body = await res.clone().text();
        const data = JSON.parse(body);
        if (data?.url && !isValidRedirectUrl(data.url)) {
          return Response.json({ url: `${base}${SAFE_CALLBACK}` }, { status: 200, headers: res.headers });
        }
      } catch {
        // ignore
      }
    }
  }

  return res;
}

export async function GET(req: NextRequest) {
  return wrapHandler(handlers.GET, req);
}

export async function POST(req: NextRequest) {
  return wrapHandler(handlers.POST, req);
}
