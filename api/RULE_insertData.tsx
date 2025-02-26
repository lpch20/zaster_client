import api from "./RULE_index";

export const addRemito = async (data: object) => {
  const url = `/addTravelRemito`;
  try {
    const response = await api.post(url, data, {});
    return response.data;
  } catch (error: any) {
    throw error.response.data.error;
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
