import axios from "axios";
import { API_URL } from "./constants";

// ✅ Get all comments for a post
export const getCommentsByPost = async (postId, sortBy = "recent") => {
  const res = await fetch(`${API_URL}/comments/${postId}?sortBy=${sortBy}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return await res.json();
};


// ✅ Add a new comment
export const addComment = async (postId, content, token) => {
  const res = await fetch(`${API_URL}/comments/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) throw new Error("Failed to add comment");
  return await res.json();
};

// ✅ Delete a comment
export const deleteComment = async (commentId, token) => {
  const res = await axios.delete(`${API_URL}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
