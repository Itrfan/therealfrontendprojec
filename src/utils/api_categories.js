import axios from "axios";
import { API_URL } from "./constants";

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) {
    console.error("Failed to fetch categories", res.status);
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

export const addCategory = async (label, token) => {
  const res = await axios.post(
    `${API_URL}/categories`,
    { label },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteCategory = async (id, token) => {
  const res = await axios.delete(`${API_URL}/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateCategory = async (id, label, token) => {
  const res = await axios.put(
    `${API_URL}/categories/${id}`,
    { label },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
