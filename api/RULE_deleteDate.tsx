import api from "./RULE_index";

export const deleteClientById = async (id: string, token:string) => {
  const url = `/deleteClientById/${id}`;
  try {
    const response = await api.put(url, {}, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const deleteChoferById = async (id: string, token:string) => {
  const url = `/deleteChofertById/${id}`;
  try {
    const response = await api.put(url, {}, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const deleteCamionById = async (id: string, token:string) => {
  const url = `/deleteCamiontById/${id}`;
  try {
    const response = await api.put(url, {}, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const deleteTrypById = async (id: string, token:string) => {
  const url = `/deleteTrypById/${id}`;
  try {
    const response = await api.put(url, {}, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const deleteRemitoById = async (id: string, token:string) => {
  const url = `/deleteRemitoById/${id}`;
  try {
    const response = await api.put(url, {}, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const deleteLiquidacionById = async (id: string, token:string) => {
  const url = `/deleteLiquidacion/${id}`;
  try {
    const response = await api.delete(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const deleteMantenimientoById = async (id: string) => {
  const url = `/deleteMantenimiento/${id}`;
  try {
    const token = localStorage.getItem("token");
    const response = await api.delete(url, { headers: { Authorization: token } });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error;
  }
};
