import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import {
    actualizarUbicacion,
    crearUbicacion,
    eliminarUbicacion,
    obtenerUbicaciones
} from "../services/ubicacionService";


type Ubicacion = {

    id_ubicacion: number;

    nombre: string;

    descripcion: string;

};


export default function Ubicaciones() {
    const router = useRouter();

    const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);

    const [nombre, setNombre] = useState("");

    const [descripcion, setDescripcion] = useState("");

    const [editando, setEditando] = useState<Ubicacion | null>(null);

    useEffect(() => {

        cargarUbicaciones();

    }, []);

    const cargarUbicaciones = async () => {

        try {

            const datos = await obtenerUbicaciones();

            setUbicaciones(datos);

        } catch (error) {

            console.log(error);

        }

    };

    const guardar = async () => {

        try {

            if (editando) {

                await actualizarUbicacion(

                    editando.id_ubicacion,

                    {

                        nombre,

                        descripcion

                    }

                );

            } else {

                await crearUbicacion({

                    nombre,

                    descripcion

                });

            }

            setNombre("");

            setDescripcion("");

            setEditando(null);

            cargarUbicaciones();

        } catch (error) {

            Alert.alert("Error", "No se pudo guardar.");

        }

    };

    const editar = (item: Ubicacion) => {

        setEditando(item);

        setNombre(item.nombre ?? "");

        setDescripcion(item.descripcion ?? "");

    };

    const eliminar = async (id: number) => {

        Alert.alert(

            "Eliminar",

            "¿Desea eliminar la ubicación?",

            [

                {

                    text: "Cancelar"

                },

                {

                    text: "Eliminar",

                    style: "destructive",

                    onPress: async () => {

                        await eliminarUbicacion(id);

                        cargarUbicaciones();

                    }

                }

            ]

        );

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
                </View>
            </View>

            <Text style={styles.titulo}>

                Ubicaciones

            </Text>

            <TextInput

                style={styles.input}

                placeholder="Nombre"

                value={nombre ?? ""}

                onChangeText={setNombre}

            />

            <TextInput

                style={styles.input}

                placeholder="Descripción"

                value={descripcion ?? ""}

                onChangeText={setDescripcion}

            />

            <TouchableOpacity

                style={styles.boton}

                onPress={guardar}

            >

                <Text style={styles.botonTexto}>

                    {editando ? "Actualizar" : "Guardar"}

                </Text>

            </TouchableOpacity>

            <FlatList

                data={ubicaciones}

                keyExtractor={(item) => item.id_ubicacion.toString()}

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <Text style={styles.nombre}>

                            {item.nombre}

                        </Text>

                        <Text>

                            {item.descripcion}

                        </Text>

                        <View style={styles.botones}>

                            <TouchableOpacity

                                onPress={() => editar(item)}

                            >

                                <Text>

                                    ✏️ Editar

                                </Text>

                            </TouchableOpacity>

                            <TouchableOpacity

                                onPress={() => eliminar(item.id_ubicacion)}

                            >

                                <Text>

                                    🗑 Eliminar

                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>

                )}

            />

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F5F7FA",
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
    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#FFF",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
    },
    boton: {
        backgroundColor: "#2563EB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    botonTexto: {
        color: "#FFF",
        textAlign: "center",
        fontWeight: "bold",
    },
    card: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    nombre: {
        fontSize: 18,
        fontWeight: "bold",
    },
    botones: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
});