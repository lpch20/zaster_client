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
