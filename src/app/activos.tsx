import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { actualizarActivo, crearActivo, obtenerActivos } from "../services/activoService";

const estadosDisponibles = ["Disponible", "Asignado", "Mantenimiento", "Baja"];

const normalizarEstado = (valor: string = "") => {
    const texto = valor.trim().toLowerCase();

    if (!texto) return "Disponible";
    if (texto.includes("dispon")) return "Disponible";
    if (texto.includes("asign") || texto.includes("uso")) return "Asignado";
    if (texto.includes("mant")) return "Mantenimiento";
    if (texto.includes("baja")) return "Baja";

    return "Disponible";
};

type Activo = {
    id_activo?: number;
    codigo?: string;
    serie?: string;
    nombre?: string;
    estado?: string;
    categoria?: string;
    marca?: string;
    categoria_nombre?: string;
    marca_nombre?: string;
};

export default function Activos() {
    const router = useRouter();
    const [activos, setActivos] = useState<Activo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroMarca, setFiltroMarca] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
    const [nombre, setNombre] = useState("");
    const [codigo, setCodigo] = useState("");
    const [serie, setSerie] = useState("");
    const [estado, setEstado] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [esAdmin, setEsAdmin] = useState(false);
    const [notificacion, setNotificacion] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

    useEffect(() => {
        cargarActivos();
        verificarPermisos();
    }, []);

    const cargarActivos = async () => {
        try {
            setCargando(true);
            const datos = await obtenerActivos();
            setActivos(Array.isArray(datos) ? datos : datos?.activos ?? []);
        } catch (error) {
            console.log(error);
        } finally {
            setCargando(false);
        }
    };

    const verificarPermisos = async () => {
        try {
            const usuarioGuardado = await AsyncStorage.getItem("usuario");
            if (usuarioGuardado) {
                const usuario = JSON.parse(usuarioGuardado);
                setEsAdmin(usuario?.id_rol === 1);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getEstadoStyle = (estado?: string) => {
        const valor = (estado ?? "").toLowerCase();

        if (valor.includes("dispon")) return styles.badgeDisponible;
        if (valor.includes("uso") || valor.includes("activo")) return styles.badgeUso;
        if (valor.includes("mant")) return styles.badgeMantenimiento;

        return styles.badgeDefault;
    };

    const activosFiltrados = activos.filter((item) => {
        const textoNombre = filtroNombre.trim().toLowerCase();
        const textoCategoria = filtroCategoria.trim().toLowerCase();
        const textoMarca = filtroMarca.trim().toLowerCase();

        const categoria = [item.categoria, item.categoria_nombre].filter(Boolean).join(" ");
        const marca = [item.marca, item.marca_nombre].filter(Boolean).join(" ");
        const textoBusqueda = [item.nombre, item.codigo, item.serie, categoria, marca]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const coincideNombre = !textoNombre || textoBusqueda.includes(textoNombre);
        const coincideCategoria = !textoCategoria || categoria.toLowerCase().includes(textoCategoria);
        const coincideMarca = !textoMarca || marca.toLowerCase().includes(textoMarca);

        return coincideNombre && coincideCategoria && coincideMarca;
    });

    const abrirEdicion = (activo: Activo) => {
        setActivoSeleccionado(activo);
        setNombre(activo.nombre ?? "");
        setCodigo(activo.codigo ?? "");
        setSerie(activo.serie ?? "");
        setEstado(normalizarEstado(activo.estado ?? ""));
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setActivoSeleccionado(null);
        setNombre("");
        setCodigo("");
        setSerie("");
        setEstado("");
    };

    const mostrarNotificacion = (tipo: "success" | "error", texto: string) => {
        setNotificacion({ tipo, texto });
        setTimeout(() => setNotificacion(null), 2500);
    };

    const crearNuevoActivo = async () => {
        if (!esAdmin) {
            Alert.alert("Acceso denegado", "Solo el administrador puede crear activos.");
            return;
        }

        if (!nombre.trim() || !codigo.trim() || !serie.trim() || !estado.trim()) {
            Alert.alert("Campos incompletos", "Completa nombre, código, serie y estado para crear el activo.");
            return;
        }

        try {
            setGuardando(true);
            await crearActivo({
                nombre: nombre.trim(),
                codigo: codigo.trim(),
                serie: serie.trim(),
                estado: estado.trim(),
            });
            await cargarActivos();
            cerrarModal();
            mostrarNotificacion("success", "Activo creado correctamente.");
            Alert.alert("Éxito", "Activo creado correctamente.");
        } catch (error) {
            console.log(error);
            mostrarNotificacion("error", "No fue posible crear el activo.");
        } finally {
            setGuardando(false);
        }
    };

    const guardarEdicion = async () => {
        if (!activoSeleccionado?.id_activo) return;

        try {
            setGuardando(true);
            await actualizarActivo(activoSeleccionado.id_activo, {
                nombre: nombre.trim(),
                codigo: codigo.trim(),
                serie: serie.trim(),
                estado: estado.trim()
            });
            await cargarActivos();
            cerrarModal();
            mostrarNotificacion("success", "Cambios guardados correctamente.");
            Alert.alert("Éxito", "Cambios guardados correctamente.");
        } catch (error) {
            console.log(error);
            mostrarNotificacion("error", "No fue posible guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    };

    const darDeBaja = async () => {
        if (!activoSeleccionado?.id_activo) return;

        try {
            setGuardando(true);
            await actualizarActivo(activoSeleccionado.id_activo, {
                estado: "Baja"
            });
            await cargarActivos();
            cerrarModal();
            mostrarNotificacion("success", "Cambios guardados correctamente.");
            Alert.alert("Éxito", "Cambios guardados correctamente.");
        } catch (error) {
            console.log(error);
            mostrarNotificacion("error", "No fue posible guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleWrap}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push("/home")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backButtonText}>← Volver</Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.title}>Activos</Text>
                        <Text style={styles.subtitle}>Listado general de activos registrados</Text>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>{activos.length}</Text>
                    <Text style={styles.summaryLabel}>registros</Text>
                </View>

                {esAdmin ? (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => {
                            setActivoSeleccionado(null);
                            setNombre("");
                            setCodigo("");
                            setSerie("");
                            setEstado("Disponible");
                            setModalVisible(true);
                        }}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.createButtonIcon}>＋</Text>
                        <Text style={styles.createButtonText}>Crear</Text>
                    </TouchableOpacity>
                ) : null}
            </View>

            {notificacion ? (
                <View style={[styles.banner, notificacion.tipo === "success" ? styles.bannerSuccess : styles.bannerError]}>
                    <Text style={styles.bannerText}>{notificacion.texto}</Text>
                </View>
            ) : null}

            <View style={styles.filtersContainer}>
                <View style={styles.filterBox}>
                    <Text style={styles.filterLabel}>Nombre</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre"
                        placeholderTextColor="#94a3b8"
                        value={filtroNombre}
                        onChangeText={setFiltroNombre}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.filterBox}>
                    <Text style={styles.filterLabel}>Categoría</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Filtrar por categoría"
                        placeholderTextColor="#94a3b8"
                        value={filtroCategoria}
                        onChangeText={setFiltroCategoria}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>

                <View style={styles.filterBox}>
                    <Text style={styles.filterLabel}>Marca</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Filtrar por marca"
                        placeholderTextColor="#94a3b8"
                        value={filtroMarca}
                        onChangeText={setFiltroMarca}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.colMain]}>Activo</Text>
                <Text style={[styles.headerText, styles.colState]}>Estado</Text>
            </View>

            {cargando ? (
                <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
            ) : activosFiltrados.length > 0 ? (
                <FlatList
                    data={activosFiltrados}
                    keyExtractor={(item: Activo, index: number) =>
                        item.id_activo ? item.id_activo.toString() : index.toString()
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.row} onPress={() => abrirEdicion(item)} activeOpacity={0.85}>
                            <View style={styles.cellPrimary}>
                                <Text style={styles.codigo}>{item.codigo ?? "Sin código"}</Text>
                                <Text style={styles.nombre} numberOfLines={1}>
                                    {item.nombre ?? "Sin nombre"}
                                </Text>
                                <Text style={styles.serie} numberOfLines={1}>
                                    {item.serie ? `Serie: ${item.serie}` : "Sin serie"}
                                </Text>
                                {item.categoria || item.categoria_nombre ? (
                                    <Text style={styles.metaText} numberOfLines={1}>
                                        {`Categoría: ${item.categoria ?? item.categoria_nombre}`}
                                    </Text>
                                ) : null}
                                {item.marca || item.marca_nombre ? (
                                    <Text style={styles.metaText} numberOfLines={1}>
                                        {`Marca: ${item.marca ?? item.marca_nombre}`}
                                    </Text>
                                ) : null}
                            </View>

                            <View style={styles.cellSecondary}>
                                <Text style={styles.label}>Estado</Text>
                                <View style={[styles.badge, getEstadoStyle(item.estado)]}>
                                    <Text style={styles.badgeText}>{item.estado ?? "Sin estado"}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No se encontraron activos</Text>
                    <Text style={styles.emptyText}>
                        {filtroNombre.trim() || filtroCategoria.trim() || filtroMarca.trim()
                            ? "Prueba con otros filtros de búsqueda."
                            : "Cuando agregues activos aparecerán aquí."}
                    </Text>
                </View>
            )}

            {modalVisible ? (
                Platform.OS === "web" ? (
                    <View style={styles.modalOverlay} accessible={false}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>{activoSeleccionado ? "Editar activo" : "Crear activo"}</Text>
                                    <Text style={styles.modalSubtitle}>{activoSeleccionado ? "Actualiza los datos o da de baja el activo." : "Ingresa los datos del nuevo activo."}</Text>
                                </View>
                                <Pressable onPress={cerrarModal} style={styles.closeButton}>
                                    <Text style={styles.closeButtonText}>✕</Text>
                                </Pressable>
                            </View>

                            <Text style={styles.fieldLabel}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={nombre}
                                onChangeText={setNombre}
                                placeholder="Nombre del activo"
                            />

                            <Text style={styles.fieldLabel}>Código</Text>
                            <TextInput
                                style={styles.input}
                                value={codigo}
                                onChangeText={setCodigo}
                                placeholder="Código"
                            />

                            <Text style={styles.fieldLabel}>Serie</Text>
                            <TextInput
                                style={styles.input}
                                value={serie}
                                onChangeText={setSerie}
                                placeholder="Serie"
                            />

                            <Text style={styles.fieldLabel}>Estado</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={estado || "Disponible"}
                                    onValueChange={(value) => setEstado(String(value))}
                                    style={styles.picker}
                                    dropdownIconColor="#2563EB"
                                >
                                    {estadosDisponibles.map((valor) => (
                                        <Picker.Item key={valor} label={valor} value={valor} />
                                    ))}
                                </Picker>
                            </View>

                            <View style={styles.modalActions}>
                                {activoSeleccionado ? (
                                    <TouchableOpacity
                                        style={[styles.secondaryButton, guardando && styles.disabledButton]}
                                        onPress={darDeBaja}
                                        disabled={guardando}
                                    >
                                        <Text style={styles.secondaryButtonText}>Dar de baja</Text>
                                    </TouchableOpacity>
                                ) : null}

                                <TouchableOpacity
                                    style={[styles.primaryButton, guardando && styles.disabledButton]}
                                    onPress={activoSeleccionado ? guardarEdicion : crearNuevoActivo}
                                    disabled={guardando}
                                >
                                    <Text style={styles.primaryButtonText}>
                                        {guardando ? "Guardando..." : activoSeleccionado ? "Guardar" : "Crear"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Modal
                        visible={modalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={cerrarModal}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalCard}>
                                <View style={styles.modalHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.modalTitle}>{activoSeleccionado ? "Editar activo" : "Crear activo"}</Text>
                                        <Text style={styles.modalSubtitle}>{activoSeleccionado ? "Actualiza los datos o da de baja el activo." : "Ingresa los datos del nuevo activo."}</Text>
                                    </View>
                                    <Pressable onPress={cerrarModal} style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>✕</Text>
                                    </Pressable>
                                </View>

                                <Text style={styles.fieldLabel}>Nombre</Text>
                                <TextInput
                                    style={styles.input}
                                    value={nombre}
                                    onChangeText={setNombre}
                                    placeholder="Nombre del activo"
                                />

                                <Text style={styles.fieldLabel}>Código</Text>
                                <TextInput
                                    style={styles.input}
                                    value={codigo}
                                    onChangeText={setCodigo}
                                    placeholder="Código"
                                />

                                <Text style={styles.fieldLabel}>Serie</Text>
                                <TextInput
                                    style={styles.input}
                                    value={serie}
                                    onChangeText={setSerie}
                                    placeholder="Serie"
                                />

                                <Text style={styles.fieldLabel}>Estado</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={estado || "Disponible"}
                                        onValueChange={(value) => setEstado(String(value))}
                                        style={styles.picker}
                                        dropdownIconColor="#2563EB"
                                    >
                                        {estadosDisponibles.map((valor) => (
                                            <Picker.Item key={valor} label={valor} value={valor} />
                                        ))}
                                    </Picker>
                                </View>

                                <View style={styles.modalActions}>
                                    {activoSeleccionado ? (
                                        <TouchableOpacity
                                            style={[styles.secondaryButton, guardando && styles.disabledButton]}
                                            onPress={darDeBaja}
                                            disabled={guardando}
                                        >
                                            <Text style={styles.secondaryButtonText}>Dar de baja</Text>
                                        </TouchableOpacity>
                                    ) : null}

                                    <TouchableOpacity
                                        style={[styles.primaryButton, guardando && styles.disabledButton]}
                                        onPress={activoSeleccionado ? guardarEdicion : crearNuevoActivo}
                                        disabled={guardando}
                                    >
                                        <Text style={styles.primaryButtonText}>
                                            {guardando ? "Guardando..." : activoSeleccionado ? "Guardar" : "Crear"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f7fb",
        paddingHorizontal: 16,
        paddingTop: 16
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginBottom: 14
    },
    headerTitleWrap: {
        flex: 1,
        marginRight: 10
    },
    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#e2e8f0",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        marginBottom: 10
    },
    backButtonText: {
        color: "#0f172a",
        fontWeight: "600",
        fontSize: 13
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a"
    },
    subtitle: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4
    },
    summaryCard: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        minWidth: 84,
        height: 44,
        alignItems: "center",
        justifyContent: "center"
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff"
    },
    summaryLabel: {
        fontSize: 11,
        color: "#dbeafe"
    },
    banner: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10
    },
    bannerSuccess: {
        backgroundColor: "#dcfce7"
    },
    bannerError: {
        backgroundColor: "#fee2e2"
    },
    bannerText: {
        color: "#0f172a",
        fontWeight: "600",
        fontSize: 13
    },
    filtersContainer: {
        marginBottom: 12,
        gap: 8
    },
    filterBox: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 4
    },
    searchInput: {
        fontSize: 14,
        color: "#0f172a"
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#e2e8f0",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    },
    headerText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: 0.4
    },
    colMain: {
        flex: 1
    },
    colState: {
        width: 110,
        alignItems: "flex-end"
    },
    listContent: {
        paddingBottom: 20
    },
    row: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        alignItems: "center"
    },
    cellPrimary: {
        flex: 1,
        paddingRight: 12
    },
    codigo: {
        fontWeight: "700",
        fontSize: 15,
        color: "#0f172a"
    },
    nombre: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 3
    },
    serie: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 2
    },
    metaText: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 2
    },
    cellSecondary: {
        width: 110,
        alignItems: "flex-end"
    },
    label: {
        fontSize: 11,
        color: "#94a3b8",
        marginBottom: 4
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0f172a"
    },
    badgeDisponible: {
        backgroundColor: "#dcfce7"
    },
    badgeUso: {
        backgroundColor: "#dbeafe"
    },
    badgeMantenimiento: {
        backgroundColor: "#fef3c7"
    },
    badgeDefault: {
        backgroundColor: "#f1f5f9"
    },
    loader: {
        marginTop: 40
    },
    emptyState: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginTop: 12
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155"
    },
    emptyText: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 6,
        textAlign: "center"
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 999,
    },
    modalCard: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 18,
        width: "100%",
        maxWidth: 520,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a"
    },
    modalSubtitle: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center"
    },
    closeButtonText: {
        fontSize: 16,
        color: "#334155"
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
        marginTop: 10,
        marginBottom: 6
    },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: "#0f172a",
        backgroundColor: "#f8fafc"
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        overflow: "hidden"
    },
    picker: {
        color: "#0f172a",
        height: 46
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 10
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#2563eb",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center"
    },
    primaryButtonText: {
        color: "#ffffff",
        fontWeight: "700"
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#f1f5f9",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center"
    },
    secondaryButtonText: {
        color: "#334155",
        fontWeight: "700"
    },
    disabledButton: {
        opacity: 0.7
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
    height: 44,
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
});