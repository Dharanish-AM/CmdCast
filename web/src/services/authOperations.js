import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};
