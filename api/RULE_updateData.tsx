import api from "./RULE_index";

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const updateRemito = async (formData: FormData) => {
  const url = `/updateTravelRemito`;
  try {
    const token = getToken();
    const response = await api.put(url, formData, {
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

export const updateClient = async (data: any) => {
  const url = `/updateClient`;
  try {
    const token = getToken();
    const response = await api.put(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};
export const updateLiquidacion = async (data: any) => {
  const url = `/updateLiquidacion`;
  try {
    const token = getToken();
    const response = await api.put(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const updateChofer = async (data: any) => {
  const url = `/updateChofer`;
  try {
    const token = getToken();
    const response = await api.put(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const updateCamion = async (data: any) => {
  const url = `/updateCamion`;
  try {
    const token = getToken();
    const response = await api.put(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};
export const updateLiquidacionConfig = async (data: any) => {
  const url = `/updateLiquidacionConfig`;
  try {
    const token = getToken();
    const response = await api.put(url, data, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const updateTrip = async (formData: FormData) => {
  const url = `/updateTrip`;
  try {
    const token = getToken();
    const response = await api.put(url, formData, {
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

export const updateTripStatus = async (id: number) => {
  const url = `/updateTripStatus/${id}`;
  try {
    const token = getToken();
    const response = await api.put(
      url,
      {},
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

export const updateLiquidacionStatus = async (id: number) => {
  const url = `/updateLiquidacionStatus/${id}`;
  try {
    const token = getToken();
    const response = await api.put(
      url,
      {},
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};
