import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  ...authConfig,
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

        // Use backend expiry (check both camelCase and snake_case), default to 15m
        const backendExpiresIn = user.expires_in || user.expiresIn || 15 * 60;
        const expiresInSeconds = parseInt(backendExpiresIn);

        if (isNaN(expiresInSeconds)) {
          // Fallback: try to decode JWT for exp claim
          try {
            const payload = JSON.parse(
              Buffer.from(user.accessToken.split(".")[1], "base64").toString()
            );
            if (payload.exp) {
              token.expiresAt = payload.exp * 1000;
              console.log(
                "[Auth] Extracted expiresAt from JWT exp claim:",
                new Date(token.expiresAt).toISOString()
              );
            } else {
              token.expiresAt = Date.now() + 15 * 60 * 1000;
            }
          } catch (e) {
            token.expiresAt = Date.now() + 15 * 60 * 1000;
          }
        } else {
          token.expiresAt = Date.now() + expiresInSeconds * 1000;
        }

        console.log(
          `[Auth] Session initialized. Expiry: ${new Date(
            token.expiresAt
          ).toLocaleString()}`
        );
        return token;
      }

      // If token is not yet expired, return it
      // Buffer of 30 seconds to prevent race conditions
      if (Date.now() < token.expiresAt - 30000) {
        return token;
      }

      // If token is expired or close to it, try to refresh
      if (token.refreshToken) {
        console.log(`[Auth] Access token expired, attempting refresh...`);
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              refreshToken: token.refreshToken, // Send in body too
            },
            {
              headers: {
                Cookie: `refreshToken=${token.refreshToken}`,
              },
              withCredentials: true,
            }
          );

          if (response.data.ok) {
            console.log("[Auth] Token refreshed successfully");
            const expiresIn =
              response.data.expires_in || response.data.expiresIn || 15 * 60;
            return {
              ...token,
              accessToken: response.data.accessToken,
              expiresAt: Date.now() + expiresIn * 1000,
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
            error.response?.data || error.message
          );
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
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
