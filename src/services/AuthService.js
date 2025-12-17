import api from "@/lib/axios";

/**
 * Login with email/password
 * Returns: { ok: true, accessToken, user: {...} }
 */
export const login = (credentials) => {
  if (!credentials.identifier || !credentials.password) {
    console.error("[AuthService] Missing credentials", {
      hasIdentifier: !!credentials.identifier,
      hasPassword: !!credentials.password,
    });
    throw new Error("Identifier and password are required");
  }

  const payload = {
    identifier: credentials.identifier,
    password: credentials.password,
  };

  console.log("[AuthService] Sending login request to /auth/login", {
    identifier: credentials.identifier,
    hasPassword: !!credentials.password,
    payload,
    url: "/auth/login",
  });

  return api.post("/auth/login", payload).catch((err) => {
    console.error("[AuthService] Login API error:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      message: err.message,
      data: err.response?.data,
    });
    throw err;
  });
};

/**
 * Refresh access token using httpOnly refresh token cookie
 * Returns: { ok: true, accessToken }
 */
export const refreshToken = () => api.post("/auth/refresh");

/**
 * Logout user and invalidate session on backend
 * Requires valid authorization header (access token)
 */
export const logout = async () => {
  try {
    // Send logout request to backend so server can invalidate session/cookie
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (err) {
    console.error(
      "Logout API error (will still clear local state):",
      err.message
    );
    // Don't throw - we want to clear local state even if logout fails
    return { ok: true };
  }
};

/**
 * Get current user profile (requires valid access token)
 * Returns: { ok: true, user: {...} }
 */
export const getMe = () => api.get("/auth/me");

/**
 * Update user profile (requires valid access token)
 * Returns: { ok: true, user: {...} }
 */
export const updateProfile = (profileData) => api.put("/auth/me", profileData);

/**
 * Change password (requires valid access token and 2FA if enabled)
 */
export const changePassword = (payload) =>
  api.post("/auth/me/password/change", payload);
