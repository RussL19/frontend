import api from "./api";
export const obtenerDepartamentos = async() => {
    const response = await api.get("/departamentos");
    return response.data;
};