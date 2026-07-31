import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";


export const obtenerAsignaciones = async () => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.get(
        "/asignaciones",
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const crearAsignacion = async (data:any) => {

    const response = await api.post(
        "/asignaciones",
        data
    );

    return response.data;
};

export const devolverActivo = async(id:number)=>{

    const token = await AsyncStorage.getItem("token");

    const response = await api.put(
        `/asignaciones/${id}/devolver`,
        {},
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const generarPDFAsignacion = async (id:number) => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.get(
        `/asignaciones/${id}/pdf`,
        {
            responseType: "blob",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const generarPDFDevolucion = async (id:number) => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.get(
        `/asignaciones/${id}/devolucion/pdf`,
        {
            responseType: "blob",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};