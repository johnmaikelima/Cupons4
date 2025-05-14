import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    if (!req.nextauth.token?.isAdmin && !req.nextUrl.pathname.includes('/auth/')) {
      return NextResponse.redirect(new URL('/admin/auth/login', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        if (req.nextUrl.pathname.includes('/auth/')) {
          return true;
        }
        return token?.isAdmin === true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
