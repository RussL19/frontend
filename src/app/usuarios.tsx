import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { actualizarUsuario, crearUsuario, eliminarUsuario, obtenerUsuarios } from "../services/usuarioService";

type Usuario = {
  id_usuario?: number;
  nombre_usuario?: string;
  correo?: string;
  id_rol?: number;
};

export default function Usuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [password, setPassword] = useState("");

  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    cargarUsuarios();
    verificarPermisos();
  }, []);

  const cargarUsuarios = async (

    paginaActual = 1

  ) => {

    try {

      setCargando(true);

      const respuesta = await obtenerUsuarios(

        paginaActual,

        10

      );

      setUsuarios(respuesta.datos);

      setPagina(respuesta.pagina);

      setTotalPaginas(respuesta.totalPaginas);

    } catch (error) {

      console.log(error);

    } finally {

      setCargando(false);

    }

  };

  const verificarPermisos = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        setEsAdmin(usuario?.id_rol === 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mostrarNotificacion = (tipo: "success" | "error", texto: string) => {
    setNotificacion({ tipo, texto });
    setTimeout(() => setNotificacion(null), 2500);
  };

  const abrirCreacion = () => {
    if (!esAdmin) {
      Alert.alert("Acceso denegado", "Solo el administrador puede crear usuarios.");
      return;
    }

    setModoCreacion(true);
    setUsuarioSeleccionado(null);
    setNombre("");
    setCorreo("");
    setRol("Supervisor");
  };

  const abrirEdicion = async (usuario: Usuario) => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem("usuario");
      const usuarioActual = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
      const admin = usuarioActual?.id_rol === 1;
      setEsAdmin(admin);

      if (!admin) {
        Alert.alert("Acceso denegado", "Solo el administrador puede editar usuarios.");
        return;
      }

      setUsuarioSeleccionado(usuario);
      setNombre(usuario.nombre_usuario ?? "");
      setCorreo(usuario.correo ?? "");
      setRol(obtenerRol(usuario.id_rol));
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo verificar tu permiso para editar.");
    }
  };

  const guardarEdicion = async () => {
    if (!esAdmin) return;

    if (!modoCreacion && !usuarioSeleccionado) return;

    try {
      setGuardando(true);

      const idRol = obtenerIdRol(rol);
      const payload = {
        nombre_usuario: nombre.trim(),
        correo: correo.trim(),
        password: password,
        id_rol: idRol,
      };

      if (modoCreacion) {
        await crearUsuario(payload);
        await cargarUsuarios();
        setModoCreacion(false);
        mostrarNotificacion("success", "Usuario creado correctamente.");
        Alert.alert("Éxito", "Usuario creado correctamente.");
      } else {
        await actualizarUsuario(usuarioSeleccionado!.id_usuario!, payload);

        const actualizados = usuarios.map((usuario) =>
          usuario.id_usuario === usuarioSeleccionado!.id_usuario
            ? { ...usuario, nombre_usuario: payload.nombre_usuario, correo: payload.correo, id_rol: payload.id_rol }
            : usuario
        );

        setUsuarios(actualizados);
        setUsuarioSeleccionado(null);
        mostrarNotificacion("success", "Cambios guardados correctamente.");
        Alert.alert("Éxito", "Cambios guardados correctamente.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo actualizar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminacion = () => {
    if (!usuarioSeleccionado || !esAdmin) return;
    setMostrarConfirmacion(true);
  };

  const eliminarUsuarioSeleccionado = async () => {
    if (!usuarioSeleccionado || !esAdmin || !usuarioSeleccionado.id_usuario) return;

    try {
      setGuardando(true);
      await eliminarUsuario(usuarioSeleccionado.id_usuario);
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== usuarioSeleccionado.id_usuario));
      setUsuarioSeleccionado(null);
      setMostrarConfirmacion(false);
      mostrarNotificacion("success", "Usuario eliminado correctamente.");
      Alert.alert("Éxito", "Usuario eliminado correctamente.");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo eliminar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  const obtenerRol = (idRol?: number) => {
    switch (idRol) {
      case 1:
        return "Administrador";
      case 2:
        return "Supervisor";
      case 3:
        return "Consulta";
      default:
        return "Sin rol";
    }
  };

  const obtenerIdRol = (valor: string) => {
    switch (valor) {
      case "Administrador":
        return 1;
      case "Supervisor":
        return 2;
      case "Consulta":
        return 3;
      default:
        return 2;
    }
  };

  return (
    <View style={styles.container}>
      {notificacion ? (
        <View
          style={{
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 10,
            backgroundColor: notificacion.tipo === "success" ? "#dcfce7" : "#fee2e2",
          }}
        >
          <Text style={{ color: "#0f172a", fontWeight: "600", fontSize: 13 }}>{notificacion.texto}</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/home")}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Usuarios</Text>
            <Text style={styles.subtitle}>Listado de usuarios del sistema</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{usuarios.length}</Text>
          <Text style={styles.summaryLabel}>usuarios</Text>
        </View>

        {esAdmin ? (
          <TouchableOpacity style={styles.createButton} onPress={abrirCreacion} activeOpacity={0.9}>
            <Text style={styles.createButtonIcon}>＋</Text>
            <Text style={styles.createButtonText}>Crear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      ) : usuarios.length > 0 ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre de usuario"
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
          <FlatList
            data={
              busqueda.trim()
                ? usuarios.filter((u) => (u.nombre_usuario ?? "").toLowerCase().includes(busqueda.trim().toLowerCase()))
                : usuarios
            }
            keyExtractor={(item: Usuario, index: number) =>
              item?.id_usuario ? item.id_usuario.toString() : index.toString()
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => abrirEdicion(item)}
              >

                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.nombre_usuario ?? "Sin nombre"}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{obtenerRol(item.id_rol)}</Text>
                  </View>
                </View>

                <Text style={styles.email}>{item.correo ?? "Sin correo"}</Text>
                <Text style={styles.editHint}>Toca para editar</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.paginacion}>

            <TouchableOpacity

              disabled={pagina === 1}

              onPress={() => cargarUsuarios(pagina - 1)}

              style={styles.botonPagina}

            >

              <Text>Anterior</Text>

            </TouchableOpacity>

            <Text>

              Página {pagina} de {totalPaginas}

            </Text>

            <TouchableOpacity

              disabled={pagina === totalPaginas}

              onPress={() => cargarUsuarios(pagina + 1)}

              style={styles.botonPagina}

            >

              <Text>Siguiente</Text>

            </TouchableOpacity>

          </View>
          {(usuarioSeleccionado || modoCreacion) && (
            <View style={styles.modalContainer}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{modoCreacion ? "Crear usuario" : "Editar usuario"}</Text>

                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Nombre del usuario"
                />

                <Text style={styles.label}>Correo</Text>
                <TextInput
                  style={styles.input}
                  value={correo}
                  onChangeText={setCorreo}
                  placeholder="Correo del usuario"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Text style={styles.label}>Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  value={password}
                  secureTextEntry
                  onChangeText={setPassword}
                />

                <Text style={styles.label}>Rol</Text>
                <View style={styles.roleOptions}>
                  {[
                    { label: "Administrador", value: "Administrador" },
                    { label: "Supervisor", value: "Supervisor" },
                    { label: "Consulta", value: "Consulta" },
                  ].map((opcion) => (
                    <TouchableOpacity
                      key={opcion.value}
                      style={[styles.roleOption, rol === opcion.value && styles.roleOptionActive]}
                      onPress={() => setRol(opcion.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.roleOptionText, rol === opcion.value && styles.roleOptionTextActive]}>
                        {opcion.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {mostrarConfirmacion && (
                  <View style={styles.confirmBox}>
                    <Text style={styles.confirmTitle}>¿Eliminar este usuario?</Text>
                    <Text style={styles.confirmText}>Esta acción no se puede deshacer.</Text>

                    <View style={styles.confirmActions}>
                      <TouchableOpacity
                        style={styles.confirmCancelButton}
                        onPress={() => setMostrarConfirmacion(false)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.confirmCancelText}>Cancelar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.confirmDeleteButton}
                        onPress={eliminarUsuarioSeleccionado}
                        activeOpacity={0.8}
                        disabled={guardando}
                      >
                        <Text style={styles.confirmDeleteText}>Sí, eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={confirmarEliminacion}
                    activeOpacity={0.8}
                    disabled={guardando}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setUsuarioSeleccionado(null);
                      setModoCreacion(false);
                      setMostrarConfirmacion(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={guardarEdicion}
                    activeOpacity={0.8}
                    disabled={guardando}
                  >
                    <Text style={styles.saveButtonText}>{guardando ? "Guardando..." : modoCreacion ? "Crear" : "Guardar"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No hay usuarios registrados</Text>
          <Text style={styles.emptyText}>Cuando agregues usuarios aparecerán aquí.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  headerContent: {
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 10,
  },
  backButtonText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 84,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#09e640",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 84,
    elevation: 4,
    shadowColor: "#0fe656",
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    marginLeft: 10,
  },
  createButtonIcon: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 16,
  },
  createButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#dbeafe",
  },
  banner: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  bannerSuccess: {
    backgroundColor: "#dcfce7",
  },
  bannerError: {
    backgroundColor: "#fee2e2",
  },
  bannerText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "600",
  },
  email: {
    fontSize: 13,
    color: "#64748b",
  },
  editHint: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 6,
    fontWeight: "600",
  },
  modalContainer: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
  },
  roleOptionActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  roleOptionText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 13,
  },
  roleOptionTextActive: {
    color: "#ffffff",
  },
  confirmBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  confirmTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  confirmText: {
    fontSize: 13,
    color: "#7F1D1D",
    marginBottom: 8,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  confirmCancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  confirmCancelText: {
    color: "#374151",
    fontWeight: "600",
  },
  confirmDeleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#DC2626",
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FECACA",
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptyText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
    textAlign: "center",
  },
  paginacion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20
  },

  botonPagina: {
    backgroundColor: "#5398c7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
});