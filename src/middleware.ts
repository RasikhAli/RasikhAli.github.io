import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // If there's a token, they are authenticated.
      // The signIn callback in [...nextauth] already checked that their username is allowed.
      return !!token;
    },
  },
});

export const config = {
  // Only protect the /admin routes, excluding login / asset files
  // Note: when running in static mode, this middleware is ignored, and client-side protection handles it.
  matcher: ["/admin/:path*"],
};
