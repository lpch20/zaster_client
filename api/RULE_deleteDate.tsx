import api from "./RULE_index";

export const deleteClientById = async (id: string) => {
  const url = `/deleteClientById/${id}`;
  try {
    const response = await api.put(url);
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
  }
};
