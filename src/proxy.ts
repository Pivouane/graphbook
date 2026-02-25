import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import type { auth } from "@/lib/auth/server";
import { routing } from "@/i18n/routing";

type Session = typeof auth.$Infer.Session;

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ["/dashboard", "/graph", "/users"];

const locales = routing.locales;

function isProtected(pathname: string) {
  return protectedRoutes.some((route) =>
    pathname.match(new RegExp(`^/(${locales.join("|")})${route}`))
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isProtected(pathname)) {
    const { data: session } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!session) {
      const locale = pathname.split("/")[1] || "en";
      return NextResponse.redirect(
        new URL(`/${locale}/sign-in`, request.url)
      );
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
