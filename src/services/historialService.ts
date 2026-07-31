import api from "./api";

export const obtenerHistorial = async () => {

    const response = await api.get("/historial");

    return response.data;

};