import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  const hostUri = (Constants.expoConfig as any)?.hostUri ?? (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://192.168.0.11:3000/api";
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