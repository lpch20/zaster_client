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

// API de Gastos - Fix para enviar FormData correctamente

export const postGasto = async (data) => {
  const url = "/postGastos";
  try {
    const token = getToken();
    
    // ✅ Determinar si es FormData (con archivos) o objeto normal
    const isFormData = data instanceof FormData;
    
    console.log("🔍 DEBUG postGasto - Tipo de data:", isFormData ? "FormData" : "Object");
    
    // ✅ CRÍTICO: Para FormData, NO establecer ningún header Content-Type
    // Axios debe detectar automáticamente multipart/form-data
    const headers = {
      Authorization: token,
      // ✅ NO agregar Content-Type para FormData - Axios lo hará automáticamente
    };
    
    // ✅ Para objetos JSON sí necesitamos Content-Type
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    
    console.log("🔍 DEBUG postGasto - Headers:", headers);
    
    const resp = await api.post(url, data, { headers });
    return resp.data;
  } catch (err) {
    console.error("❌ Error en postGasto:", err);
    throw err.response?.data?.error || err;
  }
};

// ✅ CORREGIDA: putGasto sin Content-Type para FormData
export const putGasto = async (id, data) => {
  const url = `/changeGastos/${id}`;
  try {
    const token = getToken();
    
    // ✅ Determinar si es FormData (con archivos) o objeto normal
    const isFormData = data instanceof FormData;
    
    console.log("🔍 DEBUG putGasto - ID:", id);
    console.log("🔍 DEBUG putGasto - Tipo de data:", isFormData ? "FormData" : "Object");
    console.log("🔍 DEBUG putGasto - Es FormData?:", data instanceof FormData);
    
    // ✅ CRÍTICO: Para FormData, NO establecer Content-Type
    const headers = {
      Authorization: token,
      // ✅ NO agregar Content-Type para FormData
    };
    
    // ✅ Para objetos JSON sí necesitamos Content-Type y agregar ID
    let dataToSend = data;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
      dataToSend = { id, ...data };
    }
    
    console.log("🔍 DEBUG putGasto - Headers:", headers);
    console.log("🔍 DEBUG putGasto - DataToSend type:", dataToSend instanceof FormData ? "FormData" : "Object");
    
    const resp = await api.put(url, dataToSend, { headers });
    return resp.data;
  } catch (err) {
    console.error("❌ Error en putGasto:", err);
    throw err.response?.data?.error || err;
  }
};

// ✅ Resto de funciones sin cambios
export const getGastos = async () => {
  const url = "/getGastos";
  try {
    const token = getToken();
    const resp = await api.get(url, { headers: { Authorization: token } });
    return resp.data;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const getGastoById = async (id) => {
  const url = `/getGastos/${id}`;
  try {
    const token = getToken();
    const resp = await api.get(url, { headers: { Authorization: token } });
    return resp.data;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const deleteGasto = async (id) => {
  const url = `/deleteGastos/${id}`;
  try {
    const token = getToken();
    await api.delete(url, { headers: { Authorization: token } });
    return { success: true };
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

// Combustible con archivos
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

export const postCombustible = async (formData) => {
  const url = "/postCombustible";
  try {
    const token = getToken();
    const resp = await api.post(url, formData, {
      headers: { 
        Authorization: token,
        'Content-Type': 'multipart/form-data'
      },
    });
    return resp.data.result;
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};

export const putCombustible = async (id, formData) => {
  const url = `/changeCombustible/${id}`;
  try {
    const token = getToken();
    const resp = await api.put(url, formData, {
      headers: { 
        Authorization: token,
        'Content-Type': 'multipart/form-data'
      },
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

export const getCountCombustibles = async () => {
  const url = `/getCountCombustibles`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error;
  }
};
// Función para obtener el conteo de gastos
export const getCountGastos = async () => {
  const url = `/getCountGastos`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error;
  }
};

// Cubiertas
export const getCubiertas = async () => {
  const url = `/getCubiertas`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error;
  }
};

export const getCubiertaById = async (id: string) => {
  const url = `/getCubiertaById/${id}`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error;
  }
};

export const deleteCubierta = async (id: number) => {
  const url = `/deleteCubierta/${id}`;
  try {
    const token = getToken();
    await api.delete(url, { headers: { Authorization: token } });
  } catch (err) {
    throw err.response?.data?.error || err;
  }
};
