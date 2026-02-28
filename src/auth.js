import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import axios from "axios";

/**
 * Robust refresh token strategy.
 * Attempts to refresh the access token using the refresh endpoint
 * @param {object} token - The JWT token object
 * @returns {Promise<object>} Updated token object with new access token or error
 */
async function refreshAccessToken(token) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
    console.log(`[Auth] Attempting token refresh at: ${refreshUrl}`);

    // We use fetch here to avoid interceptor side-effects during refresh
    const res = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${token.refreshToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(
        `[Auth] Refresh failed. Status: ${res.status}, Body: ${errorText}`
      );
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const data = await res.json();
    const expiresIn = data.expires_in || data.expiresIn || 7200; // default 2h
    const newExpiresAt = Date.now() + parseInt(expiresIn) * 1000;

    console.log(
      `[Auth] Token refreshed successfully. New expiry in ${Math.round(
        (newExpiresAt - Date.now()) / 1000
      )}s`
    );

    return {
      ...token,
      accessToken: data.accessToken,
      expiresAt: newExpiresAt,
      error: null,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("[Auth] RefreshAccessTokenError: Request timed out after 10s");
    } else {
      console.error("[Auth] RefreshAccessTokenError", error.message);
    }
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

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
        // Initial sign in - user object from credentials provider contains:
        // { accessToken, expiresIn, refreshToken, user: {...} }
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = user.user;
        token.error = null;

        // Use backend expiry - the value is already in seconds from backend
        const expiresInSeconds = parseInt(user.expiresIn || 7200); // fallback to 2 hours

        if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
          console.warn("[Auth] Invalid expiresIn value:", user.expiresIn, "using 2 hours default");
          token.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
        } else {
          token.expiresAt = Date.now() + expiresInSeconds * 1000;
        }

        console.log(
          `[Auth JWT] Token initialized. Expires in ${Math.round((token.expiresAt - Date.now()) / 1000)}s (user.expiresIn: ${user.expiresIn})`
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
      return refreshAccessToken(token);
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
