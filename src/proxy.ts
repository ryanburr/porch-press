import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, hasLocale, pickLocale } from "@/lib/i18n";

// Every page lives under /{lang}. A path without one goes to the reader's saved choice, else their browser's language,
// so links from before the paper was multilingual (/, /story/...) still land.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname.split("/")[1])) return;

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const lang = hasLocale(saved) ? saved : pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip the API, Next's own files, and anything with an extension (favicon.ico, apple-icon.png).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
