/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow if a JWT token is present (JWT strategy)
      if (token) return true;

      // If using database sessions, NextAuth sets a session cookie.
      // Check for the common cookie names used by NextAuth and return true if present.
      try {
        const cookies = (req as any)?.cookies;
        if (!cookies) return false;

        // NextRequest.cookies.get is available in edge runtime
        const sessionCookie =
          (typeof cookies.get === "function" && (cookies.get("next-auth.session-token") || cookies.get("__Secure-next-auth.session-token"))) ||
          // fallback: some runtimes expose cookies as a plain object
          cookies["next-auth.session-token"] ||
          cookies["__Secure-next-auth.session-token"];

        return Boolean(sessionCookie);
      } catch {
        return false;
      }
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/tasks/:path*", "/api/notifications/:path*"],
};

