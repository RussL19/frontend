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

import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { obtenerActivos } from "../services/activoService";
import { obtenerProveedores } from "../services/proveedorService";
import {
    crearMantenimiento,
    finalizarMantenimiento,
    obtenerMantenimientos
} from "../services/mantenimientoService";

export default function Mantenimientos() {

    const [lista, setLista] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activos, setActivos] = useState<any[]>([]);
    const [proveedores, setProveedores] = useState<any[]>([]);

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

            const [datos, activosLista, proveedoresLista] = await Promise.all([
                obtenerMantenimientos(),
                obtenerActivos(),
                obtenerProveedores()
            ]);

            setLista(datos);
            setActivos(Array.isArray(activosLista) ? activosLista : activosLista?.activos ?? []);
            setProveedores(Array.isArray(proveedoresLista) ? proveedoresLista : proveedoresLista?.proveedores ?? []);

            if (!idActivo && Array.isArray(activosLista) && activosLista[0]) {
                setIdActivo(String(activosLista[0].id_activo));
            }

            if (!idProveedor && Array.isArray(proveedoresLista) && proveedoresLista[0]) {
                setIdProveedor(String(proveedoresLista[0].id_proveedor));
            }

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

        const primerActivo = activos[0]?.id_activo ? String(activos[0].id_activo) : "";
        const primerProveedor = proveedores[0]?.id_proveedor ? String(proveedores[0].id_proveedor) : "";

        setIdActivo(primerActivo);
        setIdProveedor(primerProveedor);
        setDescripcion("");
        setCosto("");

    };

    const finalizar = async (id:number)=>{

    Alert.alert(
        "Finalizar",
        "¿Desea finalizar este mantenimiento?",
        [
            {text:"Cancelar"},
            {
                text:"Aceptar",
                onPress:async()=>{

                    try{

                        await finalizarMantenimiento(id);

                        setLista((prev) =>
                            prev.map((item) =>
                                item.id_mantenimiento === id
                                    ? { ...item, fecha_fin: new Date().toISOString() }
                                    : item
                            )
                        );

                        await cargar();

                        Alert.alert("Correcto","Mantenimiento finalizado.");

                    }catch(error:any){

                        console.log(error.response?.data);

                        Alert.alert(
                            "Error",
                            error.response?.data?.mensaje || error.message
                        );

                    }

                }
            }
        ]
    );

};

    const estado = (item: any) => {
        if (item.fecha_fin) {
            return { icon: "check-circle-outline", text: "Finalizado", color: "#16A34A" };
        }
        return { icon: "progress-clock", text: "En proceso", color: "#EAB308" };
    };


    return (

        <View style={styles.container}>

            <View style={styles.header}>

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
                        renderItem={({ item }) => {

                            const infoEstado = estado(item);

                            return (

                                <View style={styles.card}>

                                    <Text style={styles.nombre}>
                                        {item.Activo?.nombre}
                                    </Text>

                                    <Text>
                                        Proveedor: {item.Proveedor?.nombre}
                                    </Text>

                                    <Text>
                                        Costo: ₡ {item.costo}
                                    </Text>

                                    <View style={styles.estadoContainer}>

                                        <MaterialCommunityIcons
                                            name={infoEstado.icon as any}
                                            size={18}
                                            color={infoEstado.color}
                                        />

                                        <Text
                                            style={[
                                                styles.estadoTexto,
                                                { color: infoEstado.color }
                                            ]}
                                        >
                                            {infoEstado.text}
                                        </Text>

                                    </View>

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

                            );

                        }}
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

                        <Text style={styles.label}>Activo</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={idActivo || ""}
                                onValueChange={(value) => setIdActivo(String(value))}
                                style={styles.picker}
                                dropdownIconColor="#2563EB"
                            >
                                <Picker.Item label="Seleccione un activo" value="" />
                                {activos.map((activo) => (
                                    <Picker.Item
                                        key={activo.id_activo}
                                        label={`${activo.codigo ?? "Sin código"} - ${activo.nombre ?? "Sin nombre"}`}
                                        value={String(activo.id_activo)}
                                    />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Proveedor</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={idProveedor || ""}
                                onValueChange={(value) => setIdProveedor(String(value))}
                                style={styles.picker}
                                dropdownIconColor="#2563EB"
                            >
                                <Picker.Item label="Seleccione un proveedor" value="" />
                                {proveedores.map((proveedor) => (
                                    <Picker.Item
                                        key={proveedor.id_proveedor}
                                        label={proveedor.nombre}
                                        value={String(proveedor.id_proveedor)}
                                    />
                                ))}
                            </Picker>
                        </View>

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

    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 8,
        marginTop: 4
    },

    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 15,
        overflow: "hidden"
    },

    picker: {
        color: "#0f172a",
        height: 46
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

    backButtonContent: {
        borderColor: "#ddd"
    },

    save: {
        backgroundColor: "#2563eb",
        padding: 12,
        borderRadius: 10,
        paddingHorizontal: 25
    },
    estadoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    estadoTexto: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "600",
    },


});