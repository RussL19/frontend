import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export const obtenerUsuarios = async() => {
    const response = await api.get("/usuarios");

    console.log(response.data);

    return response.data;
};

export const crearUsuario = async(datos:any) => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.post(
        "/usuarios",
        datos,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const actualizarUsuario = async(id:number, datos:any) => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.put(
        `/usuarios/${id}`,
        datos,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const eliminarUsuario = async(id:number) => {

    const token = await AsyncStorage.getItem("token");

    const response = await api.delete(
        `/usuarios/${id}`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return response.data;
};