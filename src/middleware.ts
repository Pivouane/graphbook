import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import type { auth } from "@/lib/auth";
type Session = typeof auth.$Infer.Session;

const intlMiddleware = createMiddleware({
  locales: ["fr", "en", "es"],
  defaultLocale: "en",
  localeDetection: true,
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/dashboard")) {
    const { data: session } = await betterFetch<Session>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/dashboard", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
