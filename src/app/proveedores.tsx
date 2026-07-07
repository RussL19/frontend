import { useEffect, useState } from "react";

import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import { router } from "expo-router";

import {
    actualizarProveedor,
    crearProveedor,
    eliminarProveedor,
    obtenerProveedores
} from "../services/proveedorService";

export default function Proveedores() {

    const [proveedores, setProveedores] = useState<any[]>([]);

    const [modal, setModal] = useState(false);

    const [editar, setEditar] = useState(false);

    const [idProveedor, setIdProveedor] = useState(0);

    const [nombre, setNombre] = useState("");

    const [telefono, setTelefono] = useState("");

    const [correo, setCorreo] = useState("");
    const [notificacion, setNotificacion] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

    useEffect(() => {

        cargar();

    }, []);

    const cargar = async () => {

        const datos = await obtenerProveedores();

        setProveedores(datos);

    };

    const mostrarNotificacion = (tipo: "success" | "error", texto: string) => {
        setNotificacion({ tipo, texto });
        setTimeout(() => setNotificacion(null), 2500);
    };

    const limpiar = () => {

        setNombre("");

        setTelefono("");

        setCorreo("");

        setEditar(false);

    };

    const guardar = async () => {

        const datos = {

            nombre,
            telefono,
            correo

        };

        if (editar) {

            await actualizarProveedor(idProveedor, datos);

        } else {

            await crearProveedor(datos);

        }

        setModal(false);

        limpiar();

        await cargar();

        mostrarNotificacion("success", "Cambios guardados correctamente.");
        Alert.alert("Éxito", "Cambios guardados correctamente.");

    };

    const abrirEditar = (item: any) => {

        setEditar(true);

        setIdProveedor(item.id_proveedor);

        setNombre(item.nombre);

        setTelefono(item.telefono);

        setCorreo(item.correo);

        setModal(true);

    };

    const borrar = (id: number) => {

        Alert.alert(

            "Eliminar",

            "¿Eliminar proveedor?",

            [

                { text: "Cancelar" },

                {

                    text: "Eliminar",

                    onPress: async () => {

                        await eliminarProveedor(id);

                        cargar();

                    }

                }

            ]

        );

    };

    return (

        <View style={styles.container}>

            {notificacion ? (
                <View style={[styles.banner, notificacion.tipo === "success" ? styles.bannerSuccess : styles.bannerError]}>
                    <Text style={styles.bannerText}>{notificacion.texto}</Text>
                </View>
            ) : null}

            <View style={styles.header}>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/home")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>

                <Text style={styles.title}>

                    Proveedores

                </Text>

            </View>

            <TouchableOpacity

                style={styles.nuevo}

                onPress={() => {

                    limpiar();

                    setModal(true);

                }}

            >

                <Text style={styles.nuevoText}>

                    + Nuevo proveedor

                </Text>

            </TouchableOpacity>

            <FlatList

                data={proveedores}

                keyExtractor={(item) => item.id_proveedor.toString()}

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <Text style={styles.nombre}>

                            {item.nombre}

                        </Text>

                        <Text>

                            📞 {item.telefono}

                        </Text>

                        <Text>

                            ✉ {item.correo}

                        </Text>

                        <View style={styles.botones}>

                            <TouchableOpacity

                                style={styles.editar}

                                onPress={() => abrirEditar(item)}

                            >

                                <Text style={styles.textoBoton}>

                                    Editar

                                </Text>

                            </TouchableOpacity>

                            <TouchableOpacity

                                style={styles.eliminar}

                                onPress={() => borrar(item.id_proveedor)}

                            >

                                <Text style={styles.textoBoton}>

                                    Eliminar

                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>

                )}

            />

            <Modal

                visible={modal}

                transparent

                animationType="slide"

            >

                <View style={styles.modal}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitulo}>

                            {editar ? "Editar" : "Nuevo"} proveedor

                        </Text>

                        <TextInput

                            style={styles.input}

                            placeholder="Nombre"

                            value={nombre}

                            onChangeText={setNombre}

                        />

                        <TextInput

                            style={styles.input}

                            placeholder="Teléfono"

                            value={telefono}

                            onChangeText={setTelefono}

                        />

                        <TextInput

                            style={styles.input}

                            placeholder="Correo"

                            value={correo}

                            onChangeText={setCorreo}

                        />

                        <View style={styles.botones}>

                            <TouchableOpacity

                                style={styles.cancelar}

                                onPress={() => setModal(false)}

                            >

                                <Text>

                                    Cancelar

                                </Text>

                            </TouchableOpacity>

                            <TouchableOpacity

                                style={styles.guardar}

                                onPress={guardar}

                            >

                                <Text style={styles.textoBoton}>

                                    Guardar

                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

            </Modal>

        </View>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f5f7fb",
        padding: 20
    },

    banner: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
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
    header: {
        marginTop: 45,
        marginBottom: 20
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
        fontSize: 30,
        fontWeight: "bold"
    },

    nuevo: {
        backgroundColor: "#2563eb",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: "center"
    },

    nuevoText: {
        color: "#fff",
        fontWeight: "bold"
    },

    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 3
    },

    nombre: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6
    },

    botones: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15
    },

    editar: {
        backgroundColor: "#2563eb",
        padding: 10,
        borderRadius: 8
    },

    eliminar: {
        backgroundColor: "#dc2626",
        padding: 10,
        borderRadius: 8
    },

    textoBoton: {
        color: "#fff",
        fontWeight: "bold"
    },

    modal: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,.4)",
        padding: 20
    },

    modalCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15
    },

    modalTitulo: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 10,
        marginBottom: 15
    },

    guardar: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 8
    },

    cancelar: {
        padding: 12
    }

});