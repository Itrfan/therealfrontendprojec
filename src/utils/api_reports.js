import axios from "axios";
import { API_URL } from "./constants";

export const reportPost = async (
  postId,
  token,
  reason = "Not performative"
) => {
  const res = await axios.post(
    `${API_URL}/reports/${postId}`, // include /reports here
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getReportedPosts = async (token) => {
  const res = await axios.get(`${API_URL}/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const dismissReports = async (postId, token) => {
  const res = await axios.delete(`${API_URL}/reports/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
