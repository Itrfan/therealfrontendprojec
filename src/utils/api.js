import axios from "axios";
import { API_URL } from "./constants";

// Ensure API_URL always ends with a slash
const BASE_URL = API_URL.endsWith("/") ? API_URL : API_URL + "/";

// Create a reusable axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies if using auth cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add request/response interceptors for debugging or auth
api.interceptors.request.use(
  (config) => {
    // Example: automatically attach token if stored in localStorage or cookies
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional global error logging
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Example reusable request helpers
export const get = async (endpoint) => {
  const response = await api.get(endpoint);
  return response.data;
};

export const post = async (endpoint, data) => {
  const response = await api.post(endpoint, data);
  return response.data;
};

export const put = async (endpoint, data) => {
  const response = await api.put(endpoint, data);
  return response.data;
};

export const del = async (endpoint) => {
  const response = await api.delete(endpoint);
  return response.data;
};
