import api from "./api";

export const obtenerEmpleados = async () => {
    const response = await api.get("/empleados");
    return response.data;
};

export const obtenerEmpleado = async(id:number)=>{
    const response = await api.get(`/empleados/${id}`);
    return response.data;
}

export const crearEmpleado = async(data:any)=>{
    const response = await api.post("/empleados",data);
    return response.data;
}

export const actualizarEmpleado = async(id:number,data:any)=>{
    const response = await api.put(`/empleados/${id}`,data);
    return response.data;
}

export const eliminarEmpleado = async(id:number)=>{
    const response = await api.delete(`/empleados/${id}`);
    return response.data;
}