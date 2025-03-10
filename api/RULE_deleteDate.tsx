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
