import axios from "axios";

const api = axios.create({
  baseURL: "https://2df08321545f.ngrok-free.app/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  console.log("Sending token:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["ngrok-skip-browser-warning"] = "true"; // Bypass ngrok warning
  return config;
});

export default api;
