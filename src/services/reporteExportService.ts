import api from "./api";

export const exportarExcelActivos = async () => {

    const response = await api.get(
        "/reportes/excel",
        {
            responseType: "blob",
        }
    );

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

    const response = await api.get(
        "/reportes/pdf",
        {
            responseType: "blob",
        }
    );

    const url = window.URL.createObjectURL(response.data);

    const link = document.createElement("a");

    link.href = url;

    link.download = "Reporte_Activos.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);
};