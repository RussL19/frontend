import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const headers = async () => {

    const token = await AsyncStorage.getItem("token");

    return {

        headers: {

            Authorization: `Bearer ${token}`

        }

    };

};

export const obtenerProveedores = async () => {

    const response = await api.get(

        "/proveedores",

        await headers()

    );

    return response.data;

};

export const crearProveedor = async (datos:any) => {

    const response = await api.post(

        "/proveedores",

        datos,

        await headers()

    );

    return response.data;

};

export const actualizarProveedor = async (

    id:number,

    datos:any

) => {

    const response = await api.put(

        `/proveedores/${id}`,

        datos,

        await headers()

    );

    return response.data;

};

export const eliminarProveedor = async(id:number)=>{

    const response=await api.delete(

        `/proveedores/${id}`,

        await headers()

    );

    return response.data;

};