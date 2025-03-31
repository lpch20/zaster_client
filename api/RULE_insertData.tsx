import { getToken } from "./RULE_getData";
import api from "./RULE_index";

export const addRemito = async (formData: FormData) => {
  const url = `/addTravelRemito`;
  try {
    const token = getToken();
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    // Check if error.response exists and has data with a message property
    if (error.response?.data?.message) {
      throw error.response.data.message; // Throw the specific error message from the backend
    } else {
      throw error.message; // Fallback to the generic error message
    }
  }
};

export const addTrip = async (formData: FormData) => {
  const url = `/addTrip`;
  try {
    const token = getToken();
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const addClient = async (data: any) => {
  const url = `/addClient`;
  try {
    const token = getToken();
    const response = await api.post(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const addChofer = async (data: any) => {
  const url = `/addChofer`;
  try {
    const token = getToken();
    const response = await api.post(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};
export const addCamion = async (data: any) => {
  const url = `/addCamion`;
  try {
    const token = getToken();
    const response = await api.post(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};
export const addLiquidacion = async (data: any) => {
  const url = `/addLiquidacion`;
  try {
    const token = getToken();
    const response = await api.post(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};
