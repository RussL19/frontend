import { MaterialCommunityIcons } from "@expo/vector-icons";
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
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
    obtenerCategorias
} from "../services/categoriaService";

type Categoria = {
    id_categoria: number;
    nombre: string;
    descripcion: string;
};

export default function Categorias() {
    const router = useRouter();
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [editando, setEditando] = useState<Categoria | null>(null);

    useEffect(() => {
        cargarCategorias();
    }, []);

    const cargarCategorias = async () => {
        try {
            const datos = await obtenerCategorias();
            setCategorias(datos);
        } catch (error) {
            console.log(error);
        }
    };

    const guardar = async () => {
        try {
            if (editando) {
                await actualizarCategoria(editando.id_categoria, {
                    nombre,
                    descripcion
                });
            } else {
                await crearCategoria({
                    nombre,
                    descripcion
                });
            }
            setNombre("");
            setDescripcion("");
            setEditando(null);
            cargarCategorias();
        } catch (error) {
            Alert.alert("Error");
        }
    };

    const editar = (item: Categoria) => {
        setEditando(item);
        setNombre(item.nombre);
        setDescripcion(item.descripcion);
    };

    const eliminar = async (id: number) => {
        Alert.alert(
            "Eliminar",
            "¿Desea eliminar?",
            [
                {
                    text: "Cancelar"
                },
                {
                    text: "Sí",
                    onPress: async () => {
                        await eliminarCategoria(id);
                        cargarCategorias();
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
            <Text style={styles.titulo}>Categorías</Text>
            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
            />
            <TextInput
                placeholder="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
                style={styles.input}
            />
            <TouchableOpacity style={styles.boton} onPress={guardar}>
                <Text style={styles.botonTexto}>{editando ? "Actualizar" : "Guardar"}</Text>
            </TouchableOpacity>
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.id_categoria.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <Text>{item.descripcion}</Text>
                        <View style={styles.botones}>
                            <TouchableOpacity onPress={() => editar(item)}>
                                <MaterialCommunityIcons name="pencil-outline" size={18} color="#2563EB" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => eliminar(item.id_categoria)}>
                                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F5F7FA"
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
        marginBottom: 20
    },
    input: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10
    },
    boton: {
        backgroundColor: "#2563EB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20
    },
    botonTexto: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold"
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 12
    },
    nombre: {
        fontWeight: "bold",
        fontSize: 18
    },
    botones: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    }
});

