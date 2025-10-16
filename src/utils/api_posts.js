// utils/api_posts.js
import axios from "axios";
import { API_URL } from "./constants";

export const getPosts = async (category = "all", page = 1) => {
  const response = await axios.get(`${API_URL}/posts`, {
    params: { category, page },
  });
  return response.data;
};

export const getPostById = async (id) => {
  const response = await axios.get(`${API_URL}/posts/${id}`);
  return response.data;
};

export const deletePost = async (id, token) => {
  const response = await axios.delete(`${API_URL}/post/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 🆕 Create a new post
export const createPost = async (
  title,
  description,
  category,
  images,
  token
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);

  if (images && images.length > 0) {
    images.forEach((img) => formData.append("images", img));
  }

  const response = await axios.post(`${API_URL}/posts`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// 🆕 Edit existing post
export const updatePost = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/posts/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data; // should be an array of category names
};