import { useEffect, useState } from "react";

import {
    ActivityIndicator,
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
    crearMantenimiento,
    finalizarMantenimiento,
    obtenerMantenimientos
} from "../services/mantenimientoService";

export default function Mantenimientos() {

    const [lista, setLista] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modal, setModal] = useState(false);

    const [idActivo, setIdActivo] = useState("");

    const [idProveedor, setIdProveedor] = useState("");

    const [descripcion, setDescripcion] = useState("");

    const [costo, setCosto] = useState("");

    useEffect(() => {

        cargar();

    }, []);

    const cargar = async () => {

        try {

            setLoading(true);

            const datos = await obtenerMantenimientos();

            setLista(datos);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const guardar = async () => {

        try {

            await crearMantenimiento({

                id_activo: Number(idActivo),

                id_proveedor: Number(idProveedor),

                descripcion,

                costo: Number(costo)

            });

            Alert.alert("Correcto", "Mantenimiento registrado.");

            setModal(false);

            limpiar();

            cargar();

        } catch (error) {

            Alert.alert("Error", "No fue posible registrar.");

        }

    };

    const limpiar = () => {

        setIdActivo("");

        setIdProveedor("");

        setDescripcion("");

        setCosto("");

    };

    const finalizar = async (id: number) => {

        Alert.alert(

            "Finalizar",

            "¿Desea finalizar este mantenimiento?",

            [

                {

                    text: "Cancelar"

                },

                {

                    text: "Aceptar",

                    onPress: async () => {

                        await finalizarMantenimiento(id);

                        cargar();

                    }

                }

            ]

        );

    };

    const estado = (item: any) => {

        if (item.fecha_fin) {

            return "🟢 Finalizado";

        }

        return "🟡 En proceso";

    };

    return (

        <View style={styles.container}>

            <View style={styles.header}>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("/home")}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>

                <Text style={styles.title}>

                    Mantenimientos

                </Text>

            </View>

            <TouchableOpacity

                style={styles.button}

                onPress={() => setModal(true)}

            >

                <Text style={styles.buttonText}>

                    + Nuevo mantenimiento

                </Text>

            </TouchableOpacity>

            {

                loading ?

                    <ActivityIndicator size="large" />

                    :

                    <FlatList

                        data={lista}

                        keyExtractor={(item) => item.id_mantenimiento.toString()}

                        renderItem={({ item }) => (

                            <View style={styles.card}>

                                <Text style={styles.nombre}>

                                    {item.Activo?.nombre}

                                </Text>

                                <Text>

                                    Proveedor:

                                    {" "}

                                    {item.Proveedor?.nombre}

                                </Text>

                                <Text>

                                    Costo:

                                    ₡ {item.costo}

                                </Text>

                                <Text>

                                    {estado(item)}

                                </Text>

                                <Text>

                                    {item.descripcion}

                                </Text>

                                {

                                    !item.fecha_fin && (

                                        <TouchableOpacity

                                            style={styles.finalizar}

                                            onPress={() => finalizar(item.id_mantenimiento)}

                                        >

                                            <Text style={styles.finalizarText}>

                                                Finalizar

                                            </Text>

                                        </TouchableOpacity>

                                    )

                                }

                            </View>

                        )}

                    />

            }

            <Modal

                visible={modal}

                animationType="slide"

                transparent

            >

                <View style={styles.modal}>

                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>

                            Nuevo mantenimiento

                        </Text>

                        <TextInput

                            placeholder="Id activo"

                            value={idActivo}

                            onChangeText={setIdActivo}

                            style={styles.input}

                        />

                        <TextInput

                            placeholder="Id proveedor"

                            value={idProveedor}

                            onChangeText={setIdProveedor}

                            style={styles.input}

                        />

                        <TextInput

                            placeholder="Costo"

                            value={costo}

                            onChangeText={setCosto}

                            keyboardType="numeric"

                            style={styles.input}

                        />

                        <TextInput

                            placeholder="Descripción"

                            value={descripcion}

                            onChangeText={setDescripcion}

                            multiline

                            style={[styles.input, { height: 90 }]}

                        />

                        <View style={styles.actions}>

                            <TouchableOpacity

                                style={styles.cancel}

                                onPress={() => setModal(false)}

                            >

                                <Text>

                                    Cancelar

                                </Text>

                            </TouchableOpacity>

                            <TouchableOpacity

                                style={styles.save}

                                onPress={guardar}

                            >

                                <Text style={{ color: "#fff" }}>

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
        backgroundColor: "#f4f7fb",
        padding: 18
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
        fontWeight: "bold",
        color: "#0f172a"
    },

    button: {
        backgroundColor: "#2563eb",
        padding: 14,
        borderRadius: 12,
        marginBottom: 18,
        alignItems: "center"
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },

    card: {
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 16,
        marginBottom: 15,
        elevation: 2
    },

    nombre: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8
    },

    finalizar: {
        backgroundColor: "#22c55e",
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        alignItems: "center"
    },

    finalizarText: {
        color: "#fff",
        fontWeight: "bold"
    },

    modal: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,.5)",
        padding: 20
    },

    modalCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 18
    },

    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        backgroundColor: "#fff"
    },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between"
    },

    cancel: {
        padding: 12
    },

    save: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 10,
        paddingHorizontal: 25
    }

});