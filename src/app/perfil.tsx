import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { actualizarPerfil } from "../services/authService";

export default function Perfil() {
  const [usuario, setUsuario] = useState<any>(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [rolId, setRolId] = useState<number | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: "success" | "error"; texto: string } | null>(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const datos = await AsyncStorage.getItem("usuario");

    if (datos) {
      const usuarioGuardado = JSON.parse(datos);

      setUsuario(usuarioGuardado);
      setNombre(usuarioGuardado.nombre_usuario);
      setCorreo(usuarioGuardado.correo);
      setEsAdmin(usuarioGuardado.id_rol === 1);
      setRolId(usuarioGuardado.id_rol ?? null);

      let nombreRol = "";

      switch (usuarioGuardado.id_rol) {
        case 1:
          nombreRol = "Administrador";
          break;
        case 2:
          nombreRol = "Supervisor";
          break;
        case 3:
          nombreRol = "Consulta";
          break;
        default:
          nombreRol = "Sin rol";
      }

      setRol(nombreRol);
    }
  };

  const mostrarNotificacion = (tipo: "success" | "error", texto: string) => {
    setNotificacion({ tipo, texto });
    setTimeout(() => setNotificacion(null), 2500);
  };

  const guardarCambios = async () => {
    try {
      if (!usuario) return;

      await actualizarPerfil(usuario.id_usuario, nombre, correo, esAdmin ? rolId ?? undefined : undefined);

      const usuarioActualizado = {
        ...usuario,
        nombre_usuario: nombre,
        correo: correo,
        id_rol: esAdmin ? rolId ?? usuario.id_rol : usuario.id_rol,
      };

      await AsyncStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);

      mostrarNotificacion("success", "Cambios guardados correctamente.");
      Alert.alert("Éxito", "Cambios guardados correctamente.");
    } catch (error: any) {
      console.log(error);
      mostrarNotificacion("error", error.response?.data?.mensaje || "No fue posible actualizar el perfil.");
      Alert.alert("Error", error.response?.data?.mensaje || "No fue posible actualizar el perfil.");
    }
  };

  const inicial = (nombre || "U").charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        {notificacion ? (
          <View style={[styles.banner, notificacion.tipo === "success" ? styles.bannerSuccess : styles.bannerError]}>
            <Text style={styles.bannerText}>{notificacion.texto}</Text>
          </View>
        ) : null}

        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{inicial}</Text>
          </View>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Mi Perfil</Text>
            <Text style={styles.subtitle}>Actualiza tus datos personales y rol de acceso.</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" />

          <Text style={styles.label}>Correo</Text>
          <TextInput style={styles.input} value={correo} onChangeText={setCorreo} placeholder="Tu correo" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Rol</Text>
          {esAdmin ? (
            <View style={styles.roleOptions}>
              {[
                { id: 1, label: "Administrador" },
                { id: 2, label: "Supervisor" },
                { id: 3, label: "Consulta" },
              ].map((opcion) => (
                <TouchableOpacity
                  key={opcion.id}
                  style={[styles.roleOption, rolId === opcion.id && styles.roleOptionActive]}
                  onPress={() => setRolId(opcion.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.roleOptionText, rolId === opcion.id && styles.roleOptionTextActive]}>
                    {opcion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{rol}</Text>
            </View>
          )}

          {esAdmin && (
            <Text style={styles.helperText}>Solo los administradores pueden modificar el rol del usuario.</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={guardarCambios} activeOpacity={0.9}>
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>
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
  backIcon: {
    fontSize: 22,
    color: "#2563EB",
    marginRight: 8,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
  banner: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bannerSuccess: {
    backgroundColor: "#dcfce7",
  },
  bannerError: {
    backgroundColor: "#fee2e2",
  },
  bannerText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 13,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2563EB",
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  roleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
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
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  roleOptionText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 13,
  },
  roleOptionTextActive: {
    color: "#FFFFFF",
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: "#F1F5F9",
  },
  inputDisabledText: {
    color: "#475569",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});