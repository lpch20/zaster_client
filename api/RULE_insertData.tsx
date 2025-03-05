import api from "./RULE_index";

export const addRemito = async (formData: FormData) => {
  const url = `/addTravelRemito`;
  try {
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const addTrip = async (formData: FormData) => {
  const url = `/addTrip`;
  try {
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const addClient = async (data:any) => {
  const url = `/addClient`;
  try {
    const response = await api.post(url, data, {
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};



