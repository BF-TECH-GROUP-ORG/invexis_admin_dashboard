import axios from "axios";
import { getToken, removeToken } from "./authUtils";

const baseURL =
  (
    //https://granitic-jule-haunting.ngrok-free.dev
    // process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://ea407751ef3e.ngrok-free.app"
  ).replace(/\/$/, "") || "";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: false,
});

/* Attach token from localStorage to every request */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* Basic response interceptor to handle 401 globally */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      // clear token and redirect to login
      removeToken();
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;
