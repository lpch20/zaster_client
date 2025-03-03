import api from "./RULE_index";

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
  
export const updateTrip = async (formData: FormData) => {
    const url = `/updateTrip`;
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

export const updateTripStatus = async (id:number) => {
    const url = `/updateTripStatus/${id}`;
    try {
      const response = await api.put(url, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || error.message;
    }
  };

  