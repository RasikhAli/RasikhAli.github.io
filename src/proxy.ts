import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Allow access to /admin routes so client-side PAT authentication & NextAuth gatekeeper can both function.
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
