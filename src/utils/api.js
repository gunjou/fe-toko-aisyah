// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // baseURL: "http://127.0.0.1:5000",
  headers: { "Content-Type": "application/json" },
});

//Interceptor request: tambahkan token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: handle error 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.status;

      if (message === "Invalid username or password") {
        return Promise.reject(error);
      }

      let isLogoutTriggered = false;
      if (message === "Token expired, Login ulang") {
        if (!isLogoutTriggered) {
          isLogoutTriggered = true; // Set flag agar tidak berulang
          alert("Sesi Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
