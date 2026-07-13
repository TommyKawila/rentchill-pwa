import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAdminCookieName,
  getLoginPathForProtectedRoute,
  isAdminProtectedPath,
  isOwnerOnlyPath,
  isSuperadminOnlyPath,
  resolveOwnerSession,
} from "@/services/adminAuth";
import { isSuperadminOwner } from "@/services/superadminGuard";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("ngrok-skip-browser-warning", "true");

  const { pathname } = request.nextUrl;

  if (pathname === "/api/line/webhook" || pathname === "/api/properties/line-connect") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith("/api/cron/")) {
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
        loginUrl.pathname = getLoginPathForProtectedRoute(pathname);
        loginUrl.search = "";
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const isSuperadmin = await isSuperadminOwner(ownerId);

      if (isSuperadmin && isOwnerOnlyPath(pathname)) {
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = "/admin";
        adminUrl.search = "";
        return NextResponse.redirect(adminUrl);
      }

      if (!isSuperadmin && isSuperadminOnlyPath(pathname)) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        dashboardUrl.search = "";
        return NextResponse.redirect(dashboardUrl);
      }

      requestHeaders.set("x-owner-id", ownerId);
      requestHeaders.set("x-is-superadmin", isSuperadmin ? "1" : "0");
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("ngrok-skip-browser-warning", "true");

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|api/line/webhook|api/properties/line-connect|api/cron).*)",
};
