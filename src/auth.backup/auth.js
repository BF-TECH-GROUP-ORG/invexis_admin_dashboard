import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours in seconds (matches backend expires_in)
  },
  jwt: {
    maxAge: 2 * 60 * 60, // 2 hours in seconds (matches backend expires_in)
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        // The actual login request is handled by the server action "loginAction"
        // which sets the cookies. This authorize function validates the user data
        // passed from that action.
        if (credentials?.user) {
          try {
            const user = JSON.parse(credentials.user);
            return user;
          } catch (e) {
            console.error("[Auth] Credentials parsing error:", e);
            return null;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = user.user;
        token.error = null;

        // Use backend expiry (check both camelCase and snake_case)
        const backendExpiresIn = user.expires_in || user.expiresIn || 2 * 60 * 60; // Default 2 hours
        const expiresInSeconds = parseInt(backendExpiresIn);

        if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
          console.warn("[Auth] Invalid expiresIn value, using 2 hours default");
          token.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
        } else {
          token.expiresAt = Date.now() + expiresInSeconds * 1000;
        }

        console.log(
          `[Auth] Session initialized. Expires in ${Math.round((token.expiresAt - Date.now()) / 1000)}s`
        );
        return token;
      }

      // Return token if it has an error
      if (token.error) {
        console.log("[Auth] Token has error, returning as-is:", token.error);
        return token;
      }

      // If token is not yet expired, return it
      // Buffer of 60 seconds to prevent race conditions
      const timeUntilExpiry = token.expiresAt - Date.now();
      if (timeUntilExpiry > 60000) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Auth] Token still valid (${Math.round(timeUntilExpiry / 1000)}s remaining)`
          );
        }
        return token;
      }

      // If token is expired or close to it, try to refresh
      if (token.refreshToken) {
        console.log(
          `[Auth] Token expiring soon (${Math.round(timeUntilExpiry / 1000)}s), attempting refresh...`
        );
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            {
              headers: {
                Cookie: `refreshToken=${token.refreshToken}`,
              },
              withCredentials: true,
            }
          );

          if (response.data && response.data.ok) {
            const expiresIn =
              response.data.expires_in || response.data.expiresIn || 2 * 60 * 60; // 2 hours
            const expiresInSeconds = parseInt(expiresIn);
            const newExpiresAt = Date.now() + expiresInSeconds * 1000;

            console.log(
              "[Auth] Token refreshed successfully. New expiry in",
              Math.round((newExpiresAt - Date.now()) / 1000),
              "seconds"
            );
            return {
              ...token,
              accessToken: response.data.accessToken,
              expiresAt: newExpiresAt,
              error: null,
            };
          } else {
            console.warn(
              "[Auth] Refresh failed - response not OK",
              response.data
            );
            return { ...token, error: "RefreshAccessTokenError" };
          }
        } catch (error) {
          console.error(
            "[Auth] Refresh error:",
            error.response?.data?.message || error.message
          );
          return { ...token, error: "RefreshAccessTokenError" };
        }
      } else {
        console.warn("[Auth] No refresh token available, marking as expired");
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[Auth] Session Callback - User Role:",
          token.user?.role,
          "Error:",
          token.error
        );
      }
      session.accessToken = token.accessToken;
      session.user = token.user;
      session.error = token.error;
      return session;
    },
  },
});
