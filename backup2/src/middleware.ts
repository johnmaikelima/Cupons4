import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Permite acesso às páginas de login e registro
    if (req.nextUrl.pathname === "/admin/auth/login" || req.nextUrl.pathname === "/admin/auth/register") {
      return NextResponse.next();
    }

    // Verifica se o usuário está tentando acessar uma rota administrativa
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.isAdmin !== true
    ) {
      // Se não for admin, redireciona para o login
      return NextResponse.redirect(new URL("/admin/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permite acesso às páginas de login e registro sem token
        if (req.nextUrl.pathname === "/admin/auth/login" || req.nextUrl.pathname === "/admin/auth/register") {
          return true;
        }
        // Para outras rotas admin, requer token
        return !!token;
      },
    },
  }
);

// Configuração de quais rotas devem ser protegidas
export const config = {
  matcher: ["/admin/:path*"],
};
