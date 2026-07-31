import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { obtenerDashboard } from "../services/reporteService";

type Opcion = {
  titulo: string;
  descripcion: string;
  icono: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  ruta: string;
};

const obtenerOpciones = (rol: number): Opcion[] => {

  const opciones: Opcion[] = [];

  // ==========================
  // MÓDULOS PARA TODOS
  // ==========================
  opciones.push(
    {
      titulo: "Activos",
      descripcion: "Administrar activos de la empresa",
      icono: "cube-outline",
      ruta: "/activos"
    },
    {
      titulo: "Historial",
      descripcion: "Consultar movimientos de activos",
      icono: "history",
      ruta: "/historial"
    },
    {
      titulo: "Reportes",
      descripcion: "Consultar reportes e inventarios",
      icono: "chart-box-outline",
      ruta: "/reportes"
    },
    {
      titulo: "Mi Perfil",
      descripcion: "Editar información personal",
      icono: "account-circle-outline",
      ruta: "/perfil"
    }
  );

  // ==========================
  // SUPERVISOR Y ADMINISTRADOR
  // ==========================
  if (rol <= 2) {

    opciones.push(
      {
        titulo: "Asignaciones",
        descripcion: "Asignar activos a empleados",
        icono: "clipboard-check-outline",
        ruta: "/asignaciones"
      },
      {
        titulo: "Empleados",
        descripcion: "Administrar empleados",
        icono: "account-tie-outline",
        ruta: "/empleados"
      },
      {
        titulo: "Mantenimiento",
        descripcion: "Mantenimientos y reparaciones de activos",
        icono: "tools",
        ruta: "/mantenimiento"
      },
      {
        titulo: "Proveedores",
        descripcion: "Administrar proveedores",
        icono: "office-building-outline",
        ruta: "/proveedores"
      }
    );

  }

  // ==========================
  // SOLO ADMINISTRADOR
  // ==========================
  if (rol === 1) {

    opciones.push(
      {
        titulo: "Usuarios",
        descripcion: "Gestionar usuarios del sistema",
        icono: "account-multiple-outline",
        ruta: "/usuarios"
      },
      {
        titulo: "Categorías",
        descripcion: "Administrar categorías",
        icono: "folder-outline",
        ruta: "/categorias"
      },
      {
        titulo: "Ubicaciones",
        descripcion: "Administrar ubicaciones",
        icono: "map-marker-radius",
        ruta: "/ubicaciones"
      }
    );

  }

  return opciones;

};

export default function Home() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width >= 820;

  const [rol, setRol] = useState<number>(0);
  const [usuario, setUsuario] = useState<any>(null);
  const [dashboard, setDashboard] = useState({
    activos: 0,
    usuarios: 0,
    empleados: 0,
    disponibles: 0,
    asignados: 0,
    mantenimiento: 0,
    mantenimientos: 0,
  });

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
    await AsyncStorage.removeItem("id_rol");
    router.replace("/");
  };

  const confirmarCerrarSesion = () => {

    if (Platform.OS === "web") {

      const confirmar = window.confirm("¿Deseas cerrar la sesión?");

      if (confirmar) {
        cerrarSesion();
      }

      return;
    }

    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar la sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: cerrarSesion,
        },
      ]
    );
  };

  const totalActivos = dashboard.activos > 0 ? dashboard.activos : 1;
  const progreso = (valor: number) => Math.round((valor / totalActivos) * 100);
const modulosOrdenados = [...obtenerOpciones(rol)].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "es")
);
  useEffect(() => {
    let isMounted = true;

    const cargarDatos = async () => {
      try {
        const [usuarioGuardado, rolGuardado] = await Promise.all([
          AsyncStorage.getItem("usuario"),
          AsyncStorage.getItem("id_rol"),
        ]);

        if (!isMounted) return;

        if (usuarioGuardado) {
          try {
            setUsuario(JSON.parse(usuarioGuardado));
          } catch {
            setUsuario(null);
          }
        }

        if (rolGuardado) {
          setRol(parseInt(rolGuardado));
        }

        const datos = await obtenerDashboard();

        if (!isMounted) return;

        setDashboard((prev) => ({
          ...prev,
          ...datos,
        }));
      } catch (error) {
        if (isMounted) {
          console.log(error);
        }
      }
    };



    cargarDatos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageBody}>
          <View style={styles.headerCard}>

            <View style={styles.headerInfo}>

              <Text style={styles.title}>
                Sistema de Gestión de Activos
              </Text>

              <Text style={styles.subtitle}>
                Bienvenido {usuario?.nombre_usuario}
              </Text>

              <Text style={styles.subtitle}>
                Gestiona el ciclo de vida y disponibilidad de tus activos.
              </Text>

            </View>

            <TouchableOpacity
              style={styles.headerBadge}
              onPress={confirmarCerrarSesion}
            >
              <MaterialCommunityIcons
                name="logout-variant"
                size={24}
                color="#a50a17"
              />
            </TouchableOpacity>

          </View>

          <View style={[styles.metricGrid, esPantallaGrande ? styles.metricGridDesktop : styles.metricGridMobile]}>
            <View style={[styles.metricCard, styles.metricPrimary]}>
              <Text style={styles.metricLabel}>Activos</Text>
              <Text style={styles.metricValue}>{dashboard.activos}</Text>
            </View>
            <View style={[styles.metricCard, styles.metricSecondary]}>
              <Text style={styles.metricLabel}>Asignados</Text>
              <Text style={styles.metricValue}>{dashboard.asignados}</Text>
            </View>
            <View style={[styles.metricCard, styles.metricAccent]}>
              <Text style={styles.metricLabel}>Disponibles</Text>
              <Text style={styles.metricValue}>{dashboard.disponibles}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>

            <Text style={styles.summaryTitle}>
              Resumen del sistema
            </Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>👤 Usuarios</Text>
              <Text style={styles.summaryNumber}>{dashboard.usuarios}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>👥 Empleados</Text>
              <Text style={styles.summaryNumber}>{dashboard.empleados}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>🛠️ Mantenimientos</Text>
              <Text style={styles.summaryNumber}>{dashboard.mantenimiento}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryItem}>📦 Activos</Text>
              <Text style={styles.summaryNumber}>{dashboard.activos}</Text>
            </View>

          </View>

          <View style={[styles.optionsList, esPantallaGrande ? styles.optionsListDesktop : styles.optionsListMobile]}>
            {modulosOrdenados.map((item) => (
              <TouchableOpacity
                key={item.titulo}
                style={[styles.card, esPantallaGrande && styles.cardDesktop]}
                onPress={() => router.push(item.ruta as any)}
                activeOpacity={0.9}
              >

                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons
                    name={item.icono}
                    size={24}
                    color="#575558"
                  />
                </View>

                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardTitle}>
                    {item.titulo}
                  </Text>

                  <Text style={styles.cardDescription}>
                    {item.descripcion}
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color="#94A3B8"
                />

              </TouchableOpacity>
            ))}

          </View>
        </View>
      </ScrollView>
    </View>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
    alignItems: "center",
  },
  pageBody: {
    width: "100%",
    maxWidth: 1140,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    marginTop: 18,
    marginBottom: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerInfo: {
    flex: 1,
    paddingRight: 15,
},
  metricGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  metricGridMobile: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  metricGridDesktop: {
    flexDirection: "row",
  },
  optionsList: {
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  optionsListMobile: {
    flexDirection: "column",
  },
  optionsListDesktop: {
    flexDirection: "row",
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 95,
     width: "100%",
    marginBottom: 12,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  metricPrimary: {
    backgroundColor: "#EFF6FF",
  },
  metricSecondary: {
    backgroundColor: "#EEF2FF",
  },
  metricAccent: {
    backgroundColor: "#ECFDF5",
  },
  metricLabel: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  summaryItem: {
    fontSize: 15,
    color: "#334155",
  },

  summaryNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0c0c0e",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    fontSize: 12,
    color: "#475569",
  },
  barChart: {
    gap: 14,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  barLabel: {
    width: 90,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  barValue: {
    width: 42,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    alignContent: "center",
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
    width: "100%",
    maxWidth: 560,
  },
  cardDesktop: {
    width: "49%",
    minWidth: 320,
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
  headerBadge: {
     width: 52,
    height: 52,
    borderRadius: 26,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#EFF6FF",
  },
});