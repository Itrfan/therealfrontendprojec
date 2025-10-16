import axios from "axios";

const BASE_URL = "http://localhost:3000/api/users";

/**
 * Get user by ID
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await axios.get(`${BASE_URL}/${userId}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
};

/**
 * Get all users (optional, if you need a users list)
 * @returns {Promise<Array>}
 */
export const getAllUsers = async () => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

/**
 * Update a user (requires token)
 * @param {string} userId
 * @param {Object} data
 * @param {string} token
 * @returns {Promise<Object>}
 */
export const updateUser = async (userId, data, token) => {
  try {
    const response = await axios.put(`${BASE_URL}/${userId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};
