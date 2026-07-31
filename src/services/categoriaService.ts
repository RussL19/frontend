import api from "./api";

export const obtenerCategorias = async () => {
  const response = await api.get("/categorias");
  return response.data;
};

export const crearCategoria = async (data: any) => {
  const response = await api.post("/categorias", data);
  return response.data;
};

export const actualizarCategoria = async (id: number, data: any) => {
  const response = await api.put(`/categorias/${id}`, data);
  return response.data;
};

export const eliminarCategoria = async (id: number) => {
  const response = await api.delete(`/categorias/${id}`);
  return response.data;
};