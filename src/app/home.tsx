import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { obtenerDashboard } from "../services/reporteService";

const obtenerOpciones = (rol: number) => {

  const opcionesBase = [

    {
      titulo: "Activos",
      descripcion: "Administrar activos de la empresa",
      icono: "📦",
      ruta: "/activos"
    },
    {
      titulo: "Mi Perfil",
      descripcion: "Editar información personal",
      icono: "👤",
      ruta: "/perfil"
    }
  ];

  if (rol === 1) {
    opcionesBase.push(
      {
        titulo: "Usuarios",
        descripcion: "Gestionar usuarios del sistema",
        icono: "🧑‍💼",
        ruta: "/usuarios"
      },
      {
        titulo: "Mantenimiento",
        descripcion: "Mantenimientos y reparaciones de activos",
        icono: "⚙️",
        ruta: "/mantenimiento"
      },

      {
        titulo: "Reportes",
        descripcion: "Consultar reportes e inventarios",
        icono: "📊",
        ruta: "/reportes"
      },
      {
        titulo: "Proveedores",
        descripcion: "Administrar proveedores",
        icono: "🏢",
        ruta: "/proveedores"
      }
    );
  }

  if (rol === 2) {
    opcionesBase.push({
      titulo: "Reportes",
      descripcion: "Consultar reportes e inventarios",
      icono: "📊",
      ruta: "/reportes"
    });
  }

  return opcionesBase;
};

export default function Home() {

  const [rol, setRol] = useState<number>(0);

  useEffect(() => {
    cargarRol();
  }, []);

  const cargarRol = async () => {
    const idRol = await AsyncStorage.getItem("id_rol");

    if (idRol) {
      setRol(parseInt(idRol));
    }
  };

  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const [dashboard, setDashboard] = useState({
    activos: 0,
    usuarios: 0,
    empleados: 0,
    disponibles: 0,
    asignados: 0,
    mantenimiento: 0,
    mantenimientos: 0,
  });

  useEffect(() => {
    cargarDatos();
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

  const cargarDatos = async () => {

    const usuarioGuardado =
      await AsyncStorage.getItem("usuario");

    const rolGuardado =
      await AsyncStorage.getItem("id_rol");

    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }

    if (rolGuardado) {
      setRol(parseInt(rolGuardado));
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.eyebrow}>Panel principal</Text>
            <Text style={styles.title}>Sistema de Gestión de Activos</Text>
            <Text style={styles.subtitle}>Bienvenido {usuario?.nombre_usuario}</Text>
            <Text style={styles.subtitle}>Gestiona tu información y operaciones desde un solo lugar.</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>✓</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.cardNumber}>
              {dashboard.activos}
            </Text>
            <Text style={styles.summaryLabel}>Activos</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.cardNumber}>
              {dashboard.usuarios}
            </Text>
            <Text style={styles.summaryLabel}>Usuarios</Text>
          </View>
          <View style={styles.summaryBox}>

            <Text style={styles.cardNumber}>
              {dashboard.asignados}
            </Text>

            <Text style={styles.summaryLabel}>
              Asignados
            </Text>

          </View>
        </View>

        {obtenerOpciones(rol).map((item) => (
          <TouchableOpacity
            key={item.titulo}
            style={styles.card}
            onPress={() => (item.ruta ? router.push(item.ruta as any) : null)}
            activeOpacity={0.9}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>{item.icono}</Text>
            </View>
            <View style={styles.cardTextBlock}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDescription}>{item.descripcion}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion} activeOpacity={0.9}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}



const cerrarSesion = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("usuario");
  await AsyncStorage.removeItem("id_rol");
  router.replace("/");
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginTop: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 4,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBadgeText: {
    fontSize: 22,
    color: "#2563EB",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: "#64748B",
  },
  cardArrow: {
    fontSize: 22,
    color: "#94A3B8",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});