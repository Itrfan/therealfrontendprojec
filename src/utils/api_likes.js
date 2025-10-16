import { API_URL } from "./constants";

export const toggleLike = async (targetId, targetType, token) => {
  const res = await fetch(`${API_URL}/likes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ targetId, targetType }),
  });

  if (!res.ok) throw new Error("Failed to toggle like");
  return await res.json(); // { liked: true/false, likeCount }
};
