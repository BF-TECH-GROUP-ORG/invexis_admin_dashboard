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
        token.refreshToken = user.refreshToken; // Store refresh token in JWT
        token.user = user.user;
        // Set token expiry (15 minutes default)
        token.expiresAt = Date.now() + 15 * 60 * 1000;
      }

      // If token is not expired, return it
      if (Date.now() < token.expiresAt) {
        return token;
      }

      // If token is expired, try to refresh
      if (token.refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            {
              headers: {
                Cookie: `refreshToken=${token.refreshToken}`,
              },
            }
          );

          if (response.data.ok) {
            return {
              ...token,
              accessToken: response.data.accessToken,
              expiresAt: Date.now() + response.data.expiresIn * 1000, // expiresIn is in seconds
            };
          }
        } catch (error) {
          console.error("Error refreshing token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      session.error = token.error;
      return session;
    },
  },
});
