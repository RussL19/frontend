import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { obtenerActivos } from "../services/activoService";
import {
    crearAsignacion,
    devolverActivo,
    generarPDFAsignacion,
    generarPDFDevolucion,
    obtenerAsignaciones,
} from "../services/asignacionService";
import { obtenerEmpleados } from "../services/empleadoService";

interface Activo {
    id_activo: number;
    codigo: string;
    nombre: string;
    estado: string;
}

interface Empleado {
    id_empleado: number;
    nombre: string;
    apellido: string;
}

interface Asignacion {
    id_asignacion: number;
    fecha_asignacion: string;
    Activo: Activo;
    Empleado: Empleado;
}

export default function Ubicaciones() {
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const [activos, setActivos] = useState<Activo[]>([]);

    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

    const [activoSeleccionado, setActivoSeleccionado] = useState("");

    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");

    const [buscarActivo, setBuscarActivo] = useState("");

    useEffect(() => {

        cargarTodo();

    }, []);

    const asignacionesFiltradas = asignaciones.filter((item) => {
        const texto = buscarActivo.toLowerCase();

        return (
            item.Activo.codigo.toLowerCase().includes(texto) ||
            item.Activo.nombre.toLowerCase().includes(texto)
        );
    });

    const cargarTodo = async () => {
        try {
            setLoading(true);

            const listaActivos = await obtenerActivos();
            const listaEmpleados = await obtenerEmpleados();
            const listaAsignaciones = await obtenerAsignaciones();

            setActivos(
                listaActivos.filter(
                    (activo: Activo) => activo.estado === "Disponible"
                )
            );

            setEmpleados(listaEmpleados);

            setAsignaciones(listaAsignaciones);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const abrirBoletaPdf = async (id: number, tipo: "asignacion" | "devolucion") => {
        try {
            const pdfBlob = tipo === "asignacion"
                ? await generarPDFAsignacion(id)
                : await generarPDFDevolucion(id);

            const pdfUrl = URL.createObjectURL(
                new Blob([pdfBlob], { type: "application/pdf" })
            );

            window.open(pdfUrl, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
        } catch (error: any) {
            console.log(error);
            Alert.alert(
                "Error",
                error.response?.data?.mensaje || "No fue posible abrir la boleta."
            );
        }
    };

    const asignarActivo = async () => {
        try {
            if (!activoSeleccionado || !empleadoSeleccionado) {
                Alert.alert("Debe seleccionar un activo y un empleado.");
                return;
            }

            const asignacion = await crearAsignacion({
                id_activo: Number(activoSeleccionado),
                id_empleado: Number(empleadoSeleccionado),
            });

            Alert.alert("Éxito", "Activo asignado correctamente.");

            setActivoSeleccionado("");
            setEmpleadoSeleccionado("");

            cargarTodo();
            await abrirBoletaPdf(asignacion.id_asignacion, "asignacion");
        } catch (error) {
            console.log("ERROR COMPLETO:", error);

            Alert.alert("Error", "No fue posible realizar la asignación.");
        }
    };

    const devolver = async (id: number) => {

        console.log("Botón devolver presionado");

        try {

            const respuesta = await devolverActivo(id);

            console.log(respuesta);

            Alert.alert("Éxito", "Activo devuelto correctamente.");

            await abrirBoletaPdf(id, "devolucion");
            cargarTodo();

        } catch (error: any) {

            console.log(error);

            console.log(error.response?.data);

        }

    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push("/home")}
                        activeOpacity={0.8}
                    >
                        <View style={styles.backButtonContent}>
                            <MaterialCommunityIcons name="arrow-left" size={16} color="#0f172a" />
                            <Text style={[styles.backButtonText, { marginLeft: 8 }]}>Volver</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.title}>Asignaciones</Text>
                    <Text style={styles.subtitle}>Asignar activos a empleados</Text>
                </View>
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar activo..."
                value={buscarActivo}
                onChangeText={setBuscarActivo}
            />


            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={activoSeleccionado}
                    onValueChange={(v) => setActivoSeleccionado(v)}
                    style={styles.picker}
                    dropdownIconColor="#2563EB"
                >
                    <Picker.Item
                        label="Seleccione un activo"
                        value=""
                        color="#6B7280"
                    />

                    {activos.map((a) => (
                        <Picker.Item
                            key={a.id_activo}
                            label={`${a.codigo} - ${a.nombre}`}
                            value={a.id_activo.toString()}
                        />
                    ))}
                </Picker>
            </View>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={empleadoSeleccionado}
                    onValueChange={(v) => setEmpleadoSeleccionado(v)}
                    style={styles.picker}
                    dropdownIconColor="#2563EB"
                >
                    <Picker.Item
                        label="Seleccione un empleado"
                        value=""
                        color="#6B7280"
                    />

                    {empleados.map((e) => (
                        <Picker.Item
                            key={e.id_empleado}
                            label={`${e.nombre} ${e.apellido}`}
                            value={e.id_empleado.toString()}
                        />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity
                style={styles.createButton}
                onPress={asignarActivo}
            >
                <MaterialCommunityIcons
                    name="plus"
                    size={18}
                    color="#fff"
                />

                <Text style={styles.createButtonText}>
                    {loading ? "Asignando..." : "Asignar"}
                </Text>
            </TouchableOpacity>


            {loading ? (
                <ActivityIndicator style={styles.loader} size="large" />
            ) : (
                <FlatList
                    data={asignacionesFiltradas}
                    keyExtractor={(item) => item.id_asignacion.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.name}>
                                    {item.Activo.codigo} - {item.Activo.nombre}
                                </Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>Asignado</Text>
                                </View>
                            </View>
                            <Text style={styles.email}>{item.Empleado.nombre} {item.Empleado.apellido}</Text>
                            <Text style={styles.email}>Fecha: {item.fecha_asignacion}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => devolver(item.id_asignacion)}>
                                    <View style={styles.deleteButtonContent}>
                                        <MaterialCommunityIcons name="undo" size={16} color="#B91C1C" />
                                        <Text style={[styles.deleteButtonText, { marginLeft: 8 }]}>Devolver</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f7fb",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
    },
    headerContent: {
        flex: 1,
        marginRight: 10,
    },
    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#e2e8f0",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        marginBottom: 10,
    },
    backButtonText: {
        color: "#0f172a",
        fontWeight: "600",
        fontSize: 13,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
    },
    subtitle: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        minWidth: 84,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#09e640",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        minWidth: 84,
        elevation: 4,
        shadowColor: "#0fe656",
        shadowOpacity: 0.24,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
        marginLeft: 10,
    },
    createButtonIcon: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 16,
    },
    createButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 13,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
    },
    summaryLabel: {
        fontSize: 11,
        color: "#dbeafe",
    },
    pickerContainer: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        marginBottom: 15,
    },

    picker: {
        height: 20,
    },
    banner: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
    },
    searchInput: {
        height: 45,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        backgroundColor: "#fff",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    bannerSuccess: {
        backgroundColor: "#dcfce7",
    },
    bannerError: {
        backgroundColor: "#fee2e2",
    },
    bannerText: {
        color: "#0f172a",
        fontWeight: "600",
        fontSize: 13,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: "#dbeafe",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeText: {
        color: "#1d4ed8",
        fontSize: 12,
        fontWeight: "600",
    },
    email: {
        fontSize: 13,
        color: "#64748b",
    },
    editHint: {
        fontSize: 12,
        color: "#2563eb",
        marginTop: 6,
        fontWeight: "600",
    },
    modalContainer: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        justifyContent: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 10,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#334155",
        marginBottom: 6,
        marginTop: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 6,
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
    },

    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
        gap: 8,
        flexWrap: "wrap",
    },
    roleOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 6,
    },
    roleOption: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#F8FAFC",
    },
    roleOptionActive: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },
    roleOptionText: {
        color: "#334155",
        fontWeight: "600",
        fontSize: 13,
    },
    roleOptionTextActive: {
        color: "#ffffff",
    },
    confirmBox: {
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        padding: 12,
        marginTop: 10,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    confirmTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#991B1B",
        marginBottom: 4,
    },
    confirmText: {
        fontSize: 13,
        color: "#7F1D1D",
        marginBottom: 8,
    },
    backButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    confirmActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
    },
    confirmCancelButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    confirmCancelText: {
        color: "#374151",
        fontWeight: "600",
    },
    confirmDeleteButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#DC2626",
    },
    confirmDeleteText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#FECACA",
    },
    deleteButtonText: {
        color: "#B91C1C",
        fontWeight: "600",
    },
    cancelButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#E2E8F0",
    },
    cancelButtonText: {
        color: "#334155",
        fontWeight: "600",
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#2563eb",
    },
    saveButtonText: {
        color: "#ffffff",
        fontWeight: "600",
    },
    loader: {
        marginTop: 32,
    },
    emptyState: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginTop: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155",
    },
    emptyText: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 6,
        textAlign: "center",
    },
    paginacion: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20
    },

    botonPagina: {
        backgroundColor: "#5398c7",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10
    },
});