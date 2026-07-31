import api from "./api";

export const obtenerUbicaciones = async () => {
    const response = await api.get("/ubicaciones");
    return response.data;
};

export const crearUbicacion = async (data:any) => {
    const response = await api.post("/ubicaciones", data);
    return response.data;
};

export const actualizarUbicacion = async (id:number, data:any) => {
    const response = await api.put(`/ubicaciones/${id}`, data);
    return response.data;
};

export const eliminarUbicacion = async (id:number) => {
    const response = await api.delete(`/ubicaciones/${id}`);
    return response.data;
};