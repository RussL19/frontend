import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export const obtenerActivos = async () => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.get("/activos", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

export const obtenerActivo = async (id:number) => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.get(`/activos/${id}`,{
        headers:{
            Authorization:`Bearer ${token}`
        }
    });

    return response.data;
};

export const crearActivo = async(datos:any)=>{

    const token=await AsyncStorage.getItem("token");

    const response=await api.post(
        "/activos",
        datos,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;

};

export const actualizarActivo=async(id:number,datos:any)=>{

    const token=await AsyncStorage.getItem("token");

    const response=await api.put(
        `/activos/${id}`,
        datos,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;

};

export const eliminarActivo=async(id:number)=>{

    const token=await AsyncStorage.getItem("token");

    const response=await api.delete(
        `/activos/${id}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;

};