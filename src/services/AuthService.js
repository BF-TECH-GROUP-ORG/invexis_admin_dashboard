import api from "@/lib/axios";

export const login = (credentials) => {
  console.log("Login request payload:", credentials);
  return api.post("/auth/login", credentials, {
    headers: { "Content-Type": "application/json" },
  });
};

export const registerSuperAdmin = (payload) =>
  api.post("/auth/register", payload);

export const refreshToken = (token) =>
  api.get("/auth/refresh", { refreshToken: token });

export const logout = async () => {
  try {
    const token = localStorage.getItem("invexis_token");
    // Send logout request to backend with token so server can invalidate session
    const response = await api.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    // Even if backend fails, we should still clear client-side state
    console.error(
      "Logout API error (will still clear local state):",
      err.message
    );
    throw err;
  }
};
