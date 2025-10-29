import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextMiddlewareResult } from "next/dist/server/web/types";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;
  const isAuthenticated = !!token;
  const isLoginPage = pathname === "/login";
  const isShowCase = pathname.startsWith("/showcase");
  const custom_attributes = token?.custom_attributes as string[] ?? []

  // If not authenticated and trying to access protected routes,
  // preserve the complete URL (including UTM) as callbackUrl
  if (!isAuthenticated && !isLoginPage) {
    // Check if it's a protected path
    const protectedPaths = [
      "/hackathons/registration-form",
      "/hackathons/project-submission",
      "/showcase",
      "/profile",
      "/student-launchpad"
    ];

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath) {
      const currentUrl = req.url;
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", currentUrl);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAuthenticated) {

    if (isLoginPage)
      return NextResponse.redirect(new URL("/", req.url));

    //TODO Change this line to enable showcase to a different set of users
    if (isShowCase && !custom_attributes.includes('showcase'))
      return NextResponse.redirect(new URL("/hackathons", req.url))

    // Protect hackathons/edit route - only team1-admin and hackathonCreator can access
    if (pathname.startsWith("/hackathons/edit")) {
      const hasRequiredPermissions = custom_attributes.includes("team1-admin") || 
                                   custom_attributes.includes("hackathonCreator")  || 
                                   custom_attributes.includes("devrel");
      if (!hasRequiredPermissions) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

  }
  return withAuth(
    (authReq: NextRequestWithAuth): NextMiddlewareResult => {
      return NextResponse.next();
    },
    {
      pages: {
        signIn: "/login",
      },
      callbacks: {
        authorized: ({ token }) => !!token,

      }
    }
  )(req as NextRequestWithAuth, {} as any);
}

export const config = {
  matcher: [
    "/hackathons/registration-form/:path*",
    "/hackathons/project-submission/:path*",
    "/hackathons/edit/:path*",
    "/showcase/:path*",
    "/login/:path*",
    "/profile/:path*",
    "/academy/:path*/get-certificate",
    "/academy/:path*/certificate",
    "/console/utilities/data-api-keys",
  ],
};
