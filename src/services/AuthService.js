import apiClient from "@/lib/apiClient";

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

  return apiClient.post("/auth/login", payload);
};

/**
 * Refresh access token using httpOnly refresh token cookie
 * Returns: { ok: true, accessToken }
 */
export const refreshToken = () => apiClient.post("/auth/refresh");

/**
 * Logout user and invalidate session on backend
 * Requires valid authorization header (access token)
 * @param {string} token - Optional access token to send with logout request
 */
export const logout = async (token = null) => {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Send logout request to backend so server can invalidate session/cookie
    const response = await apiClient.post("/auth/logout", {}, { headers });
    return response;
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
export const getMe = () => apiClient.get("/auth/me");

/**
 * Update user profile (requires valid access token)
 * Returns: { ok: true, user: {...} }
 */
export const updateProfile = (profileData) =>
  apiClient.put("/auth/me", profileData);

/**
 * Change password (requires valid access token and 2FA if enabled)
 */
export const changePassword = (payload) =>
  apiClient.post("/auth/me/password/change", payload);
