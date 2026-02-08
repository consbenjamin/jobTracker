import { auth } from "@/lib/auth";

const protectedPaths = ["/applications", "/quick-capture", "/analytics"];
const publicPaths = ["/", "/login", "/register", "/auth-error"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isApiAuth = pathname.startsWith("/api/auth");
  const hasSession = !!req.auth;

  if (isApiAuth) return;
  if (pathname.startsWith("/api")) return;
  if (isPublic) return;
  if (isProtected && !hasSession) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.*|manifest.json|sw.js|api/auth).*)"],
};
