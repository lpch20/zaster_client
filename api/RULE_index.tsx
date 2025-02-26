import axios from "axios";

const api = axios.create({
  baseURL: 'https://zaster-back.vercel.app/api',
  headers: {
    'Content-Type': 'application/json', // Verifica que este encabezado esté presente
  },
});


export default api;
