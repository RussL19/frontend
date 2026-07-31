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
        mantenimientos: conteoMantenimientos ?? Number(
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

export const exportarExcelActivos = async () => {
  const response = await api.get("/reportes/excel", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Reporte_Activos.xlsx";

  document.body.appendChild(link);
  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export const exportarPDFActivos = async () => {
  const response = await api.get("/reportes/pdf", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Reporte_Activos.pdf";

  document.body.appendChild(link);
  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

export const generarReporte = async (datos: any) => {

    const response = await api.post(
        "/reportes/generar",
        datos,
        {
            responseType: "blob"
        }
    );

    

    let nombreArchivo = "";

    switch (datos.tipoReporte) {

        case "activos":
            nombreArchivo = datos.tipo === "pdf"
                ? "Reporte_Activos.pdf"
                : "Reporte_Activos.xlsx";
            break;

        case "asignaciones":
            nombreArchivo = datos.tipo === "pdf"
                ? "Reporte_Asignaciones.pdf"
                : "Reporte_Asignaciones.xlsx";
            break;

        case "mantenimientos":
            nombreArchivo = datos.tipo === "pdf"
                ? "Reporte_Mantenimientos.pdf"
                : "Reporte_Mantenimientos.xlsx";
            break;

        case "historial":
            nombreArchivo = datos.tipo === "pdf"
                ? "Reporte_Historial.pdf"
                : "Reporte_Historial.xlsx";
            break;

        default:
            nombreArchivo = datos.tipo === "pdf"
                ? "Reporte.pdf"
                : "Reporte.xlsx";
    }

    const url = window.URL.createObjectURL(response.data);

    const link = document.createElement("a");

    link.href = url;
    link.download = nombreArchivo;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

};

export const descargarExcel = async (url: string, nombre: string) => {

    const response = await api.get(url, {
        responseType: "blob",
    });

    const blob = new Blob([response.data]);

    const archivo = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = archivo;

    link.download = nombre;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(archivo);

};

export const descargarPDF = async (url: string, nombre: string) => {

    const response = await api.get(url, {
        responseType: "blob",
    });

    const blob = new Blob([response.data]);

    const archivo = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = archivo;

    link.download = nombre;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(archivo);

};