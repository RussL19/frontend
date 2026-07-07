import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { obtenerDashboard } from "../services/reporteService";

export default function Reportes() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState({
    activos: 0,
    disponibles: 0,
    asignados: 0,
    mantenimiento: 0,
    usuarios: 0,
    empleados: 0
  });

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      const datos = await obtenerDashboard();
      setDashboard(datos);
    } catch (error) {
      console.log(error);
    }
  };

  const Card = ({
    titulo,
    valor,
  }: {
    titulo: string;
    valor: number;
  }) => (
    <View style={styles.card}>
      <Text style={styles.numero}>{valor}</Text>
      <Text style={styles.tituloCard}>{titulo}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/home")}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Reportes del Sistema
      </Text>

      <Text style={styles.subtitle}>
        Información general en tiempo real
      </Text>

      <View style={styles.grid}>

        <Card
          titulo="Activos"
          valor={dashboard.activos}
        />

        <Card
          titulo="Disponibles"
          valor={dashboard.disponibles}
        />

        <Card
          titulo="Asignados"
          valor={dashboard.asignados}
        />

        <Card
          titulo="Mantenimiento"
          valor={dashboard.mantenimiento}
        />

        <Card
          titulo="Usuarios"
          valor={dashboard.usuarios}
        />

        <Card
          titulo="Empleados"
          valor={dashboard.empleados}
        />

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    padding: 20,
  },

  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  backButtonText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },

  subtitle: {
    color: "#64748B",
    marginBottom: 20,
    marginTop: 5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },

  numero: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2563EB",
  },

  tituloCard: {
    marginTop: 10,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },

});