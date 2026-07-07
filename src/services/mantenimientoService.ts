import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const getHeaders = async () => {

    const token = await AsyncStorage.getItem("token");

    return {

        headers: {
            Authorization: `Bearer ${token}`
        }

    };

};

export const obtenerMantenimientos = async () => {

    const response = await api.get(
        "/mantenimientos",
        await getHeaders()
    );

    return response.data;

};

export const crearMantenimiento = async (datos:any) => {

    const response = await api.post(
        "/mantenimientos",
        datos,
        await getHeaders()
    );

    return response.data;

};

export const finalizarMantenimiento = async(id:number)=>{

    const response=await api.patch(

        `/mantenimientos/${id}/finalizar`,

        {},

        await getHeaders()

    );

    return response.data;

};