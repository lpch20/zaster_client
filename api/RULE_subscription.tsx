import api from "./RULE_index";

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// ✅ CREAR SUSCRIPCIÓN
export const createSubscription = async (subscriptionData: {
  plan_type: string;
}) => {
  const url = `/create`;
  try {
    const token = getToken();
    const response = await api.post(url, subscriptionData, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.response?.data?.message || error;
  }
};

// ✅ OBTENER SUSCRIPCIÓN DEL USUARIO
export const getUserSubscription = async () => {
  const url = `/my-subscription`;
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.response?.data?.message || error;
  }
};

// ✅ CANCELAR SUSCRIPCIÓN
export const cancelSubscription = async () => {
  const url = `/cancel`;
  try {
    const token = getToken();
    const response = await api.post(url, {}, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.response?.data?.message || error;
  }
};

// ✅ SINCRONIZAR SUSCRIPCIÓN CON MERCADOPAGO
export const syncSubscription = async (mercadoPagoId: string) => {
  const url = `/sync/${mercadoPagoId}`;
  try {
    const token = getToken();
    const response = await api.post(url, {}, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.response?.data?.message || error;
  }
};

// ✅ OBTENER TODAS LAS SUSCRIPCIONES (ADMIN)
export const getAllSubscriptions = async (filters?: {
  status?: string;
  plan_type?: string;
}) => {
  let url = `/admin/all`;
  
  if (filters) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.plan_type) params.append('plan_type', filters.plan_type);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.response?.data?.message || error;
  }
};
