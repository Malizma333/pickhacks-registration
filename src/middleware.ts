import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/", "/dashboard"];
const authRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  let sessionToken = request.cookies.get("better-auth.session_token");
  sessionToken = sessionToken ?? request.cookies.get("__Secure-better-auth.session_token");
  console.info("Session token", sessionToken);
  const isAuthenticated = !!sessionToken?.value;
  console.info("Is authenticated", isAuthenticated);

  // Admin routes - redirect to /admin/login if not authenticated
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Regular domain authentication checks
  // Redirect authenticated users away from auth pages (but not admin login)
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login
  if (protectedRoutes.includes(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
