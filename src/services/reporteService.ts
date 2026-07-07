import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export const obtenerDashboard = async () => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.get("/reportes/dashboard", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};