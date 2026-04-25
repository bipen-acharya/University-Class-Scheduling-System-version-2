import axios, { AxiosHeaders } from "axios";
import { toast } from "sonner";

let isRedirecting = false;

const api = axios.create({
  baseURL: "https://unischeduling.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (!token) return config;

    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers);

    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    const isAuthRequest =
      url.includes("/login") ||
      url.includes("/register");

    if (status === 401 && !isAuthRequest && !isRedirecting) {
      isRedirecting = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user_name");
      localStorage.removeItem("roles");
      localStorage.removeItem("auth_user");

      toast.error("Session expired. Please login again.", {
        duration: 1200,
      });

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1200);
    }

    return Promise.reject(error);
  },
);

export default api;