import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  return (
    envUrl || "https://gestion-activos-api.onrender.com/api"
  ).replace(/\/+$/, "");
};



const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


export default api;