import api from "./RULE_index";

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const getChoferes = async () => {
  const url = `/getChoferes`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getChoferesById = async (id: string) => {
  const url = `/getChoferById/${id}`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getRemito = async () => {
  const url = `/getRemito`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const getRemitoNotUploadInTrip = async () => {
  const url = `/getRemitoNotUploadInTrip`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getRemitoNumber = async () => {
  const url = `/getRemitoNumber`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getRemitoById = async (id: string) => {
  const url = `/getRemitoById/${id}`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getClients = async () => {
  const url = `/getClients`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const getClientsById = async (ids: []) => {
  const url = `/getClientsByIds`;
  try {
    const token = getToken();
    const response = await api.post(url, ids, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getTrip = async () => {
  const url = `/getTrip`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const getTripNotUploadInLiquidation = async () => {
  const url = `/getTripNotUploadInLiquidation`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getTripById = async (id: string) => {
  const url = `/getTripById/${id}`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCamiones = async () => {
  const url = `/getCamiones`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getLiquidacion = async () => {
  const url = `/getLiquidacion`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getLiquidacionConfig = async () => {
  const url = `/getLiquidacionConfig`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCamionesById = async (id: number) => {
  const url = `/getCamionById/${id}`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const getLiquidacionById = async (id: number) => {
  const url = `/getLiquidacionById/${id}`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCountLiquidacion = async () => {
  const url = `/getCountLiquidacion`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCountRemito = async () => {
  const url = `/getCountRemito`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCountCamiones = async () => {
  const url = `/getCountCamiones`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCountTrip = async () => {
  const url = `/getCountTrip`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCountChoferes = async () => {
  const url = `/getCountChoferes`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getCountClients = async () => {
  const url = `/getCountClients`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

// Gastos
export const getGastos = async () => {
  const url = "/getGastos";
  try {
    const token = getToken();
    const resp = await api.get(url, { headers: { Authorization: token } });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const getGastoById = async (id) => {
  const url = `/getGastos/${id}`;
  try {
    const token = getToken();
    const resp = await api.get(url, { headers: { Authorization: token } });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const postGasto = async (data) => {
  const url = "/postGastos";
  try {
    const token = getToken();
    const resp = await api.post(url, data, {
      headers: { Authorization: token },
    });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const putGasto = async (id, data) => {
  const url = `/changeGstos/${id}`;
  try {
    const token = getToken();
    const resp = await api.put(url, data, {
      headers: { Authorization: token },
    });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const deleteGasto = async (id) => {
  const url = `/deleteGastos/${id}`;
  try {
    const token = getToken();
    await api.delete(url, { headers: { Authorization: token } });
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

// Combustible
export const getCombustibles = async () => {
  const url = "/getCombustible";

  try {
    const token = await getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const getCombustibleById = async (id) => {
  const url = `/getCombustible/${id}`;
  try {
    const token = getToken();
    const resp = await api.get(url, { headers: { Authorization: token } });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const postCombustible = async (data) => {
  const url = "/postCombustible";
  try {
    const token = getToken();
    const resp = await api.post(url, data, {
      headers: { Authorization: token },
    });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const putCombustible = async (id, data) => {
  const url = `/changeCombustible/${id}`;
  try {
    const token = getToken();
    const resp = await api.put(url, data, {
      headers: { Authorization: token },
    });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const deleteCombustible = async (id) => {
  const url = `/deleteCombustible/${id}`;
  try {
    const token = getToken();
    await api.delete(url, { headers: { Authorization: token } });
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};
