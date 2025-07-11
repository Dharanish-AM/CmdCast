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

export const loginUser = async (email, password, dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email,
      password,
    });
    if (response?.status == 200) {
      dispatch({
        type: "SET_AUTH",
        payload: {
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          error: null,
        },
      });
      localStorage.setItem("token", response.data.token);
      return {
        message: response.data.message,
        success: true,
        user: response.data.user,
        token : response.data.token
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const getUser = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/users/get-user?token=${token}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};
