"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import axios from "axios";
import { cookies } from "next/headers";

export async function loginAction(prevState, formData) {
  const identifier = formData.get("identifier");
  const password = formData.get("password");

  if (!identifier || !password) {
    return "Missing credentials";
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        identifier,
        password,
      },
      {
        timeout: 15000, // 15s timeout for login
      }
    );

    const data = response.data;
    if (process.env.NODE_ENV === "development") {
      console.log("[LoginAction] Backend response keys:", Object.keys(data));
      console.log(
        "[LoginAction] expiresIn:",
        data.expiresIn,
        "expires_in:",
        data.expires_in
      );
    }

    if (!data.ok) {
      return "Login failed";
    }

    // Handle Cookies
    const setCookieHeaders = response.headers["set-cookie"];
    let refreshTokenValue = null;

    if (setCookieHeaders) {
      const cookieStore = await cookies();

      // Parse and set each cookie
      setCookieHeaders.forEach((cookieString) => {
        const [nameValue, ...options] = cookieString.split("; ");
        const [name, value] = nameValue.split("=");

        // Extract refreshToken value before setting cookie
        if (name === "refreshToken") {
          refreshTokenValue = value;
        }

        const cookieOptions = {};
        options.forEach((opt) => {
          const [key, val] = opt.split("=");
          if (key.toLowerCase() === "httponly") cookieOptions.httpOnly = true;
          if (key.toLowerCase() === "secure") cookieOptions.secure = true;
          if (key.toLowerCase() === "path") cookieOptions.path = val;
          if (key.toLowerCase() === "samesite")
            cookieOptions.sameSite = val.toLowerCase();
          if (key.toLowerCase() === "max-age")
            cookieOptions.maxAge = parseInt(val);
          if (key.toLowerCase() === "expires")
            cookieOptions.expires = new Date(val);
        });

        cookieStore.set(name, value, cookieOptions);
      });
    }

    // Prepare clean user data for NextAuth JWT
    // The backend returns: { ok, accessToken, expires_in, user: {...}, ... }
    // Build a compact payload for NextAuth credentials provider
    const signInPayload = {
      accessToken: data.accessToken,
      refreshToken: refreshTokenValue,
      user: data.user || null,
      expires_in: data.expires_in || data.expiresIn || null,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[LoginAction] User data prepared for JWT:", {
        accessToken: data.accessToken?.substring(0, 20) + "...",
        expiresIn: signInPayload.expires_in,
        refreshToken: refreshTokenValue ? "present" : "missing",
        userId: data.user?._id,
        userRole: data.user?.role,
      });
    }

    // Sign in with NextAuth (store session server-side)
    // Pass the user object as a JSON string to the credentials provider
    await signIn("credentials", {
      user: JSON.stringify(signInPayload),
      redirect: false,
    });

    // Return accessToken to client as a fallback so the client can attach it
    // immediately (useful before NextAuth client state hydrates).
    return {
      success: true,
      accessToken: data.accessToken,
      expires_in: data.expires_in || data.expiresIn,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }

    // Check for axios error response
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED" || error.code === "ECONNRESET") {
        return "Server connection timed out or reset. Please check if the API is running.";
      }
      if (error.response) {
        return error.response.data?.message || "Authentication failed";
      }
    }

    console.error("Login action error:", error);
    return "Authentication failed";
  }
}
