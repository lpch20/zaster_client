import api from "./RULE_index";

export const getChoferes = async () => {
  const url = `/getChoferes`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getChoferesById = async (id:string) => {
  const url = `/getChoferById/${id}`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};


export const getRemitoNumber = async () => {
  const url = `/getRemitoNumber`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};

export const getRemitoById = async (id: string) => {
  const url = `/getRemitoById/${id}`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const getClients = async () => {
  const url = `/getClients`;
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
export const getClientsById = async (ids:[]) => {
  const url = `/getClientsByIds`;
  try {
    const response = await api.post(url,ids);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
