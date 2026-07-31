import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { obtenerCategorias } from "../services/categoriaService";
import { generarReporte, obtenerDashboard } from "../services/reporteService";
import { obtenerUbicaciones } from "../services/ubicacionService";

export default function Reportes() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esDesktop = width >= 820;

  const [dashboard, setDashboard] = useState({
    activos: 0,
    disponibles: 0,
    asignados: 0,
    mantenimiento: 0,
    baja: 0,
    usuarios: 0,
    empleados: 0,
  });

  useEffect(() => {
    cargarDashboard();
    cargarCategorias();
    cargarUbicaciones();
  }, []);

  const cargarDashboard = async () => {
    try {
      const datos = await obtenerDashboard();
      setDashboard((prev) => ({
        ...prev,
        ...datos,
      }));
    } catch (error) {
      console.log(error);
    }
  };



  const cargarCategorias = async () => {

    try {

      const datos = await obtenerCategorias();

      setCategorias(datos);

    } catch (error) {

      console.log(error);

    }

  };

  const cargarUbicaciones = async () => {

    try {

      const datos = await obtenerUbicaciones();

      setUbicaciones(datos);

    } catch (error) {

      console.log(error);

    }

  };

  const [categorias, setCategorias] = useState<any[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [tipoReporte, setTipoReporte] = useState("activos");
  const [tipoArchivo, setTipoArchivo] = useState("excel");

  const generar = async () => {

    try {

      await generarReporte({

        tipoReporte,

        categoria: categoriaSeleccionada,

        ubicacion: ubicacionSeleccionada,

        estado: estadoSeleccionado,

        fechaInicio,

        fechaFinal,

        tipo: tipoArchivo

      });

    } catch (error) {

      console.log(error);

    }

  };


  const totalActivos = dashboard.activos > 0 ? dashboard.activos : 1;
  const porcentaje = (valor: number) => Math.round((valor / totalActivos) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/home")}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.heroCard}>
        <View>
          <Text style={styles.title}>Reportes del Sistema</Text>
          <Text style={styles.subtitle}>Consola profesional de los activos y su estado.</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Actualizado</Text>
        </View>
      </View>

      <View style={[styles.metricGrid, esDesktop ? styles.row : styles.column]}>
        <View style={[styles.metricCard, styles.blueCard]}>
          <Text style={styles.metricLabel}>Activos</Text>
          <Text style={styles.metricValue}>{dashboard.activos}</Text>
          <Text style={styles.metricNote}>{porcentaje(dashboard.activos)}% del total</Text>
        </View>
        <View style={[styles.metricCard, styles.tealCard]}>
          <Text style={styles.metricLabel}>Asignados</Text>
          <Text style={styles.metricValue}>{dashboard.asignados}</Text>
          <Text style={styles.metricNote}>{porcentaje(dashboard.asignados)}% asignados</Text>
        </View>
        <View style={[styles.metricCard, styles.greenCard]}>
          <Text style={styles.metricLabel}>Disponibles</Text>
          <Text style={styles.metricValue}>{dashboard.disponibles}</Text>
          <Text style={styles.metricNote}>{porcentaje(dashboard.disponibles)}% disponibles</Text>
        </View>
      </View>

      <View style={styles.chartCard}>

        <Text style={styles.sectionTitle}>
          Estado de los activos
        </Text>

        <Text style={styles.chartSubtitle}>
          Visualiza el estado actual del inventario.
        </Text>

        {/* Disponible */}

        <View style={styles.progressRow}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Disponible</Text>
            <Text style={styles.progressValue}>{dashboard.disponibles}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                styles.fillGreen,
                {
                  width: `${porcentaje(dashboard.disponibles)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Asignado */}

        <View style={styles.progressRow}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Asignado</Text>
            <Text style={styles.progressValue}>{dashboard.asignados}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                styles.fillBlue,
                {
                  width: `${porcentaje(dashboard.asignados)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Mantenimiento */}

        <View style={styles.progressRow}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Mantenimiento</Text>
            <Text style={styles.progressValue}>{dashboard.mantenimiento}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                styles.fillYellow,
                {
                  width: `${porcentaje(dashboard.mantenimiento)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Baja */}

        <View style={styles.progressRow}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Baja</Text>
            <Text style={styles.progressValue}>{dashboard.baja}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                styles.fillRed,
                {
                  width: `${porcentaje(dashboard.baja)}%`,
                },
              ]}
            />
          </View>
        </View>

      </View>


      <Text style={styles.sectionTitle}>Indicadores clave</Text>
      <View style={[styles.grid, esDesktop ? styles.rowWrap : styles.column]}>
        <View style={[styles.statCard, esDesktop && styles.halfWidth]}>
          <View style={[styles.pill, { backgroundColor: "#FDE68A" }]}>
            <Text style={[styles.pillText, { color: "#B45309" }]}>Mantenimiento</Text>
          </View>
          <Text style={styles.statNumber}>{dashboard.mantenimiento}</Text>
          <Text style={styles.statDescription}>Solicitudes pendientes o completadas.</Text>
        </View>

        <View style={[styles.statCard, esDesktop && styles.halfWidth]}>
          <View style={[styles.pill, { backgroundColor: "#DDD6FE" }]}>
            <Text style={[styles.pillText, { color: "#6D28D9" }]}>Usuarios</Text>
          </View>
          <Text style={styles.statNumber}>{dashboard.usuarios}</Text>
          <Text style={styles.statDescription}>Usuarios del sistema con acceso activo.</Text>
        </View>

        <View style={[styles.statCard, esDesktop && styles.halfWidth]}>
          <View style={[styles.pill, { backgroundColor: "#CFFAFE" }]}>
            <Text style={[styles.pillText, { color: "#0C4A6E" }]}>Empleados</Text>
          </View>
          <Text style={styles.statNumber}>{dashboard.empleados}</Text>
          <Text style={styles.statDescription}>Personas relacionadas con los activos.</Text>
        </View>
      </View>

      <View style={styles.filterCard}>

        <Text style={styles.filterTitle}>
          Generar Reporte
        </Text>

        {/* Tipo de reporte */}

        <Text style={styles.label}>
          Tipo de Reporte
        </Text>

        <Picker
          selectedValue={tipoReporte}
          onValueChange={setTipoReporte}
          style={styles.picker}
        >
          <Picker.Item label="Activos" value="activos" />
          <Picker.Item label="Asignaciones" value="asignaciones" />
          <Picker.Item label="Mantenimientos" value="mantenimientos" />
          <Picker.Item label="Historial" value="historial" />
        </Picker>

        {/* Categoría */}

        <Text style={styles.label}>
          Categoría
        </Text>

        <Picker
          selectedValue={categoriaSeleccionada}
          onValueChange={(value) => setCategoriaSeleccionada(value)}
          style={styles.picker}
        >
          <Picker.Item
            label="Todas"
            value=""
          />

          {categorias.map((categoria) => (

            <Picker.Item
              key={categoria.id_categoria}
              label={categoria.nombre}
              value={categoria.id_categoria.toString()}
            />

          ))}

        </Picker>

        {/* Ubicación */}

        <Text style={styles.label}>
          Ubicación
        </Text>

        <Picker
          selectedValue={ubicacionSeleccionada}
          onValueChange={(value) => setUbicacionSeleccionada(value)}
          style={styles.picker}
        >
          <Picker.Item
            label="Todas"
            value=""
          />

          {ubicaciones.map((ubicacion) => (

            <Picker.Item
              key={ubicacion.id_ubicacion}
              label={ubicacion.nombre}
              value={ubicacion.id_ubicacion.toString()}
            />

          ))}

        </Picker>

        {/* Estado */}

        <Text style={styles.label}>
          Estado
        </Text>

        <Picker
          selectedValue={estadoSeleccionado}
          onValueChange={(value) => setEstadoSeleccionado(value)}
          style={styles.picker}
        >
          <Picker.Item label="Todos" value="" />
          <Picker.Item label="Disponible" value="Disponible" />
          <Picker.Item label="Asignado" value="Asignado" />
          <Picker.Item label="Mantenimiento" value="Mantenimiento" />
        </Picker>

        {/* Fecha inicio */}

        <Text style={styles.label}>
          Fecha Inicio
        </Text>

        <TextInput
          style={styles.input}
          placeholder="2026-01-01"
          value={fechaInicio}
          onChangeText={setFechaInicio}
        />

        {/* Fecha final */}

        <Text style={styles.label}>
          Fecha Final
        </Text>

        <TextInput
          style={styles.input}
          placeholder="2026-12-31"
          value={fechaFinal}
          onChangeText={setFechaFinal}
        />

        <Text style={styles.label}>
          Formato
        </Text>

        <Picker
          selectedValue={tipoArchivo}
          onValueChange={setTipoArchivo}
          style={styles.picker}
        >
          <Picker.Item
            label="Excel (.xlsx)"
            value="excel"
          />

          <Picker.Item
            label="PDF (.pdf)"
            value="pdf"
          />
        </Picker>

      </View>


      <TouchableOpacity

        style={styles.generateButton}
        onPress={generar}

      >

        <Text style={styles.generateText}>

          Generar Reporte

        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  backButtonText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  badge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369A1",
  },
  metricGrid: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  column: {
    flexDirection: "column",
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  blueCard: {
    backgroundColor: "#EFF6FF",
  },
  tealCard: {
    backgroundColor: "#ECFEFF",
  },
  greenCard: {
    backgroundColor: "#ECFDF5",
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: "800",
  },
  metricNote: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 20,
  },
  progressRow: {
    marginBottom: 16,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  fillBlue: {
    backgroundColor: "#2563EB",
  },
  fillTeal: {
    backgroundColor: "#0EA5E9",
  },
  fillGreen: {
    backgroundColor: "#22C55E",
  },
  grid: {
    justifyContent: "space-between",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  halfWidth: {
    width: "48%",
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
  },
  card: {

    backgroundColor: "#fff",

    borderRadius: 15,

    padding: 20,

    marginBottom: 15,

    elevation: 3

  },

  icono: {

    fontSize: 30,

    marginBottom: 10

  },

  titulo: {

    fontSize: 20,

    fontWeight: "bold"

  },

  descripcion: {

    color: "#666",

    marginBottom: 15

  },

  botones: {

    flexDirection: "row",

    justifyContent: "space-between"

  },

  excel: {

    backgroundColor: "#16A34A",

    padding: 12,

    borderRadius: 8,

    width: "48%",

    alignItems: "center"

  },

  pdf: {

    backgroundColor: "#DC2626",

    padding: 12,

    borderRadius: 8,

    width: "48%",

    alignItems: "center"

  },

  botonTexto: {

    color: "#fff",

    fontWeight: "bold"

  },
  filterCard: {

    backgroundColor: "#FFF",

    padding: 20,

    borderRadius: 20,

    marginBottom: 25,

    elevation: 4

  },

  filterTitle: {

    fontSize: 22,

    fontWeight: "bold",

    marginBottom: 15

  },

  label: {

    fontWeight: "600",

    marginTop: 10,

    marginBottom: 5

  },

  input: {

    borderWidth: 1,

    borderColor: "#D1D5DB",

    borderRadius: 10,

    padding: 12,

    backgroundColor: "#F9FAFB"

  },
  generateButton: {

    backgroundColor: "#2563EB",

    padding: 16,

    borderRadius: 12,

    marginTop: 20,

    alignItems: "center"

  },

  generateText: {

    color: "#FFF",

    fontWeight: "bold",

    fontSize: 17

  },
  picker: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    marginBottom: 15,
  },
  fillYellow: {
    backgroundColor: "#FACC15",
  },

  fillRed: {
    backgroundColor: "#EF4444",
  },
});

