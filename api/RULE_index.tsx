import axios from "axios";

const api = axios.create({
  baseURL: 'http://zaster-back.vercel.app/api',
  headers: {
    'Content-Type': 'application/json', // Verifica que este encabezado esté presente
  },
});


export default api;


//PROD
 // baseURL: 'https://zaster-back.vercel.app/api',
//DEV
 // baseURL: 'http://localhost:8000/api',