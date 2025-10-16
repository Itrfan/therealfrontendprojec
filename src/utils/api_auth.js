import axios from "axios";
import { API_URL } from "./constants";

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const signup = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/signup`, {
    name,
    email,
    password,
  });
  return response.data;
};
