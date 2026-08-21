export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/") &&
        !nextUrl.pathname.startsWith("/auth");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    // We will handle role checks in the middleware or page/layout logic more specifically if needed,
    // but the authorized callback is the main gatekeeper.
  },
  providers: [], // Configured in auth.js
};
