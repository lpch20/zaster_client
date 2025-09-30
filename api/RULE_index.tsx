import axios from "axios";

const api = axios.create({
  baseURL: 'https://zaster-back.vercel.app/api',
});


export default api;


//PROD
 // baseURL: 'https://zaster-back.vercel.app/api',
//DEV
 // baseURL: 'http://localhost:8000/api',