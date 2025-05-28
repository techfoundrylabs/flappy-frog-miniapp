// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Applica a tutte le richieste
export const config = {
  matcher: "/:path*",
};

const allowedPaths = ["/", "/ranking", "/user", "/info"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Escludi anche asset statici e favicon
  const isStaticAsset =
    pathname.startsWith("/_next") || pathname === "/favicon.ico";

  if (!allowedPaths.includes(pathname) && !isStaticAsset) {
    return NextResponse.redirect("https://flappyfrog.xyz", 303);
  }

  return NextResponse.next();
}
