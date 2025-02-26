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
