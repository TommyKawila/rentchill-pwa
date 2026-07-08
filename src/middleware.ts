import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAdminCookieName,
  isAdminProtectedPath,
  resolveOwnerSession,
} from "@/services/adminAuth";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("ngrok-skip-browser-warning", "true");

  const { pathname } = request.nextUrl;

  if (pathname === "/api/line/webhook") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const adminSecret = process.env.ADMIN_SECRET;

  if (isAdminProtectedPath(pathname)) {
    if (!adminSecret) {
      if (process.env.NODE_ENV === "production") {
        const message = "ADMIN_SECRET not configured";
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: message }, { status: 503 });
        }
        return new NextResponse(message, { status: 503 });
      }
    } else {
      const token = request.cookies.get(getAdminCookieName())?.value;
      const ownerId = await resolveOwnerSession(adminSecret, token);

      if (!ownerId) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      requestHeaders.set("x-owner-id", ownerId);
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("ngrok-skip-browser-warning", "true");

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api/line/webhook).*)",
};
