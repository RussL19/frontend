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
    actualizarEmpleado,
    crearEmpleado,
    eliminarEmpleado,
    obtenerEmpleados
} from "../services/empleadoService";

import { obtenerDepartamentos } from "../services/departamentoService";


import { Picker } from "@react-native-picker/picker";
type Departamento = {

    id_departamento: number;

    nombre: string;

}

type Empleado = {

    id_empleado: number;

    nombre: string;

    apellido: string;

    cedula: string;

    telefono: string;

    correo: string;

    puesto: string;

    id_departamento: number;

    Departamento?: Departamento;

}

export default function Empleados() {
    const router = useRouter();

    const [empleados, setEmpleados] = useState<Empleado[]>([]);

    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

    const [editando, setEditando] = useState<Empleado | null>(null);

    const [nombre, setNombre] = useState("");

    const [apellido, setApellido] = useState("");

    const [cedula, setCedula] = useState("");

    const [telefono, setTelefono] = useState("");

    const [correo, setCorreo] = useState("");

    const [puesto, setPuesto] = useState("");

    const [departamento, setDepartamento] = useState("");



    useEffect(() => {

        cargar();

        cargarDepartamentos();

    }, []);

    const cargarDepartamentos = async () => {
        try {
            const datos = await obtenerDepartamentos();
            setDepartamentos(datos);
        } catch (error) {
            console.log(error);
        }
    };

    const cargar = async () => {

        const datos = await obtenerEmpleados();

        setEmpleados(datos);

    }

    const guardar = async () => {

        const empleado = {

            nombre,

            apellido,

            cedula,

            telefono,

            correo,

            puesto,

            id_departamento: Number(departamento)

        };

        if (editando) {

            await actualizarEmpleado(

                editando.id_empleado,

                empleado

            );

        } else {

            await crearEmpleado(empleado);

        }

        limpiar();

        cargar();

    }

    const editar = (item: Empleado) => {

        setEditando(item);

        setNombre(item.nombre);

        setApellido(item.apellido);

        setCedula(item.cedula);

        setTelefono(item.telefono);

        setCorreo(item.correo);

        setPuesto(item.puesto);

        setDepartamento(item.id_departamento.toString());

    }

    const eliminar = async (id: number) => {

        Alert.alert(

            "Eliminar",

            "¿Eliminar empleado?",

            [

                {

                    text: "Cancelar"

                },

                {

                    text: "Eliminar",

                    style: "destructive",

                    onPress: async () => {

                        await eliminarEmpleado(id);

                        cargar();

                    }

                }

            ]

        );

    }

    const limpiar = () => {

        setEditando(null);

        setNombre("");

        setApellido("");

        setCedula("");

        setTelefono("");

        setCorreo("");

        setPuesto("");

        setDepartamento("");

    }
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
            <Text style={styles.titulo}>Empleados</Text>



            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
            />

            <TextInput
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
                style={styles.input}
            />

            <TextInput
                placeholder="Cédula"
                value={cedula}
                onChangeText={setCedula}
                style={styles.input}
            />

            <TextInput
                placeholder="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                style={styles.input}
            />

            <TextInput
                placeholder="Correo"
                value={correo}
                onChangeText={setCorreo}
                style={styles.input}
            />

            <TextInput
                placeholder="Puesto"
                value={puesto}
                onChangeText={setPuesto}
                style={styles.input}
            />
            <View style={styles.pickerContainer}>
                <MaterialCommunityIcons
                    name="office-building"
                    size={22}
                    color="#2563EB"
                    style={{ marginLeft: 12 }}
                />

                <Picker
                    selectedValue={departamento}
                    onValueChange={setDepartamento}
                    style={{ flex: 1, height: 55 }}
                    dropdownIconColor="#2563EB"
                >
                    <Picker.Item
                        label="Seleccione departamento"
                        value=""
                    />

                    {departamentos.map((dep) => (
                        <Picker.Item
                            key={dep.id_departamento}
                            label={dep.nombre}
                            value={dep.id_departamento.toString()}
                        />
                    ))}
                </Picker>
            </View>



            <TouchableOpacity

                style={styles.boton}

                onPress={guardar}

            >

                <Text style={styles.botonTexto}>

                    {

                        editando ?

                            "Actualizar" :

                            "Guardar"

                    }

                </Text>

            </TouchableOpacity>

            <FlatList
                data={empleados}
                keyExtractor={(item) => item.id_empleado.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.nombre}>
                            {item.nombre} {item.apellido}
                        </Text>
                        <Text>{item.cedula}</Text>
                        <Text>{item.puesto}</Text>
                        <Text>{item.Departamento?.nombre}</Text>
                        <View style={styles.botones}>
                            <TouchableOpacity onPress={() => editar(item)}>
                                <MaterialCommunityIcons name="pencil-outline" size={18} color="#2563EB" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => eliminar(item.id_empleado)}>
                                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
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
        backgroundColor: "#FFF",
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
        color: "#FFF",
        textAlign: "center",
        fontWeight: "bold"
    },
    card: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10
    },
    nombre: {
        fontSize: 18,
        fontWeight: "bold"
    },
    botones: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 5,
    },

    picker: {
        height: 55,
    },
});