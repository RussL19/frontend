import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { obtenerMantenimientos } from "./mantenimientoService";

const contarMantenimientos = (valor: any) => {
    if (Array.isArray(valor)) return valor.length;
    if (Array.isArray(valor?.mantenimientos)) return valor.mantenimientos.length;
    if (Array.isArray(valor?.data)) return valor.data.length;
    if (Array.isArray(valor?.items)) return valor.items.length;
    if (Array.isArray(valor?.results)) return valor.results.length;

    return null;
};

const normalizarDashboard = (datos: any, mantenimientos: any) => {
    const conteoMantenimientos = contarMantenimientos(mantenimientos);

    return {
        activos: Number(datos?.activos ?? datos?.totalActivos ?? 0),
        disponibles: Number(datos?.disponibles ?? datos?.totalDisponibles ?? 0),
        asignados: Number(datos?.asignados ?? datos?.totalAsignados ?? 0),
        mantenimiento: conteoMantenimientos ?? Number(
            datos?.mantenimiento ??
            datos?.mantenimientos ??
            datos?.totalMantenimientos ??
            datos?.totalMantenimiento ??
            datos?.countMantenimiento ??
            0
        ),
        usuarios: Number(datos?.usuarios ?? datos?.totalUsuarios ?? 0),
        empleados: Number(datos?.empleados ?? datos?.totalEmpleados ?? 0),
    };
};

export const obtenerDashboard = async () => {

    const token = await AsyncStorage.getItem("token");

    const [responseDashboard, responseMantenimientos] = await Promise.all([
        api.get("/reportes/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }),
        obtenerMantenimientos()
    ]);

    return normalizarDashboard(responseDashboard.data, responseMantenimientos);
};