import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  nombre_usuario: string;
  correo: string;
  password: string;
  id_rol?: number;
}

const obtenerUsuariosGuardados = async () => {
  const usuariosGuardados = await AsyncStorage.getItem("usuarios");

  if (!usuariosGuardados) {
    return [];
  }

  try {
    return JSON.parse(usuariosGuardados);
  } catch {
    return [];
  }
};

const tryBackendRegister = async (data: RegisterRequest) => {
  const endpoints = ["/register", "/usuarios", "/users"];

  for (const endpoint of endpoints) {
    try {
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const isNetworkError = error?.message?.includes("Network Error");
      const isNotFound = status === 404;

      if (!isNotFound && !isNetworkError) {
        throw error;
      }

      console.log(`Registro no disponible en ${endpoint}:`, error?.message || status);
    }
  }

  return null;
};

export const register = async (data: RegisterRequest) => {
  const backendResult = await tryBackendRegister(data);

  if (backendResult) {
    return backendResult;
  }

  const usuarios = await obtenerUsuariosGuardados();

  const existeUsuario = usuarios.some(
    (usuario: any) => usuario.correo.toLowerCase() === data.correo.toLowerCase()
  );

  if (existeUsuario) {
    throw new Error("El correo ya está registrado");
  }

  const nuevoUsuario = {
    id: Date.now(),
    nombre_usuario: data.nombre_usuario,
    correo: data.correo,
    password: data.password,
    id_rol: data.id_rol ?? 2,
  };

  usuarios.push(nuevoUsuario);

  await AsyncStorage.setItem("usuarios", JSON.stringify(usuarios));

  return {
    token: `local-token-${nuevoUsuario.id}`,
    usuario: {
      id: nuevoUsuario.id,
      nombre_usuario: nuevoUsuario.nombre_usuario,
      correo: nuevoUsuario.correo,
      id_rol: nuevoUsuario.id_rol,
    },
    fallbackLocal: true,
  };
};

export const login = async (data: LoginRequest) => {
  try {
    const response = await api.post("/login", data);
    return response.data;
  } catch (error) {
    const usuarios = await obtenerUsuariosGuardados();
    const usuarioLocal = usuarios.find(
      (usuario: any) =>
        usuario.correo.toLowerCase() === data.correo.toLowerCase() &&
        usuario.password === data.password
    );

    if (usuarioLocal) {
      return {
        token: `local-token-${usuarioLocal.id}`,
        usuario: {
          id: usuarioLocal.id,
          nombre_usuario: usuarioLocal.nombre_usuario,
          correo: usuarioLocal.correo,
          id_rol: usuarioLocal.id_rol,
        },
      };
    }

    throw error;
  }
};

export const actualizarPerfil = async (
  id: number,
  nombre_usuario: string,
  correo: string,
  id_rol?: number
) => {
  const token = await AsyncStorage.getItem("token");

  const response = await api.put(
    `/usuarios/${id}`,
    {
      nombre_usuario,
      correo,
      ...(id_rol !== undefined ? { id_rol } : {}),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
