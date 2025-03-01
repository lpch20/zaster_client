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

export const updateRemito = async (formData: FormData) => {
  const url = `/updateTravelRemito`;
  try {
    const response = await api.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const getRemito = async () => {
  const url = `/getRemito`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
