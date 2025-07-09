import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const pairDevice = async (deviceId, code) => {
  try {
    const response = await axios.post(`${API_URL}/api/devices/pair`, {
      deviceId,
      code,
    });
    return response.data;
  } catch (error) {
    console.error("Pairing error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export const getDeviceStatus = async (deviceId) => {
  try {
    const response = await axios.get(`${API_URL}/api/devices/status/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching device status:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
};