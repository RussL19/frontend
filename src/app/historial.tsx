import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { obtenerHistorial } from "../services/historialService";


interface Movimiento {

  id_movimiento: number;

  tipo_movimiento: string;

  detalle: string;

  fecha: string;

  Activo: {

    codigo: string;

    nombre: string;

  };

}

export default function Historial() {

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const [historial, setHistorial] = useState<Movimiento[]>([]);

  const [buscarActivo, setBuscarActivo] = useState("");

  useEffect(() => {

    cargarHistorial();

  }, []);

  const historialFiltradas = historial.filter((item) => {
    const texto = buscarActivo.toLowerCase();

    return (
      item.Activo.codigo.toLowerCase().includes(texto) ||
      item.Activo.nombre.toLowerCase().includes(texto)
    );
  });

  const cargarHistorial = async () => {

    try {

      setLoading(true);

      const datos = await obtenerHistorial();

      setHistorial(datos);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (



      <View style={styles.loader}>

        <ActivityIndicator size="large" />

      </View>

    );

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
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar activo..."
        value={buscarActivo}
        onChangeText={setBuscarActivo}
      />



      <FlatList

        data={historialFiltradas}

        keyExtractor={(item) => item.id_movimiento.toString()}

        renderItem={({ item }) => (

          <View style={styles.card}>

            <Text style={styles.codigo}>
              {item.Activo.codigo}
            </Text>

            <Text style={styles.nombre}>
              {item.Activo.nombre}
            </Text>

            <Text style={styles.tipo}>
              {item.tipo_movimiento}
            </Text>

            <Text>
              {item.detalle}
            </Text>

            <Text style={styles.fecha}>
              {item.fecha}
            </Text>

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
  searchInput: {
     borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#dbeafe",
    marginTop: 4,
    fontSize: 14,
  },

  list: {
    padding: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  codigo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },

  nombre: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
    color: "#111827",
  },

  tipo: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#059669",
  },

  detalle: {
    marginTop: 5,
    color: "#4b5563",
  },

  fecha: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});