import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { login, register } from "../services/authService";
export default function LoginScreen() {

  const [correo, setCorreo] = useState("");  // Estado para almacenar el correo electrónico ingresado por el usuario
  const [password, setPassword] = useState("");  // Estado para almacenar el correo electrónico ingresado por el usuario
  const [mostrarPerfil, setMostrarPerfil] = useState(false); // Estado para controlar si se muestra la pantalla de perfil o no
  const [mostrarRegistro, setMostrarRegistro] = useState(false);  // Estado para controlar si se muestra la pantalla de registro o la de inicio de sesión
  const [nombreUsuario, setNombreUsuario] = useState("");  // Estado para almacenar el nombre de usuario durante el registro
  const [correoRegistro, setCorreoRegistro] = useState("");  // Estado para almacenar el correo durante el registro
  const [passwordRegistro, setPasswordRegistro] = useState("");  // Estado para almacenar la contraseña durante el registro
  const [confirmarPasswordRegistro, setConfirmarPasswordRegistro] = useState("");  // Estado para almacenar la confirmación de la contraseña durante el registro

  useEffect(() => {
    verificarSesion();  // Función que verifica si el usuario ya ha iniciado sesión previamente y redirige a la pantalla de inicio si es así
  }, []);

  const verificarSesion = async () => {  // Función que verifica si el usuario ya ha iniciado sesión previamente y redirige a la pantalla de inicio si es así
    try {

      const token = await AsyncStorage.getItem("token");
      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (token && usuarioGuardado) {
        setMostrarPerfil(true);
        router.replace("/home");
      } else {
        setMostrarPerfil(false);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const iniciarSesion = async () => {  // Función que maneja el inicio de sesión del usuario, enviando los datos al backend y almacenando el token y la información del usuario en AsyncStorage
    try {


      const respuesta = await login({
        correo,
        password,
      });

      await AsyncStorage.setItem(
        "token",
        respuesta.token
      );

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.usuario)
      );

      await AsyncStorage.setItem(
        "id_rol",
        respuesta.usuario.id_rol.toString()
      );

      setMostrarPerfil(true);



      Alert.alert("Éxito", "Login correcto");

      router.replace("/home");

    } catch (error: any) {

      console.log(error.response?.data);

      Alert.alert(
        "No se pudo iniciar sesión",
        error.response?.data?.mensaje || "Ha ocurrido un error."
      );

    }
  };

  const registrarNuevoUsuario = async () => {   // Función que maneja el registro de un nuevo usuario, validando los campos y enviando los datos al backend o guardándolos localmente si el backend no está disponible
    if (!nombreUsuario.trim() || !correoRegistro.trim() || !passwordRegistro.trim() || !confirmarPasswordRegistro.trim()) {
      Alert.alert("Campos requeridos", "Completa todos los campos para registrar un usuario");
      return;
    }

    if (passwordRegistro !== confirmarPasswordRegistro) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const respuesta = await register({  //  Llama a la función register del servicio de autenticación para registrar un nuevo usuario
        nombre_usuario: nombreUsuario,
        correo: correoRegistro,
        password: passwordRegistro,
      });

      await AsyncStorage.setItem("token", respuesta.token);  // Almacena el token recibido del backend en AsyncStorage para mantener la sesión del usuario
      await AsyncStorage.setItem("usuario", JSON.stringify(respuesta.usuario));  // Almacena la información del usuario recibido del backend en AsyncStorage para mantener la sesión del usuario

      setMostrarPerfil(true);
      setMostrarRegistro(false);
      setNombreUsuario("");
      setCorreoRegistro("");
      setPasswordRegistro("");
      setConfirmarPasswordRegistro("");

      const mensajeBase = "Tu usuario ha sido creado correctamente";
      const mensajeFinal = respuesta.fallbackLocal
        ? `${mensajeBase}. Nota: el registro se guardó localmente en el dispositivo.`
        : mensajeBase;

      Alert.alert("Registro exitoso", mensajeFinal);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("No se pudo registrar", error.message || "Inténtalo nuevamente");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGlow} />
      <View style={styles.backgroundGlowSecondary} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.brandBadge}>
              <Text style={styles.logo}>�</Text>
            </View>

            <Text style={styles.title}>Gestión de Activos</Text>
            <Text style={styles.subtitle}>
              {mostrarRegistro ? "Crea tu cuenta para empezar" : "Inicie sesión para continuar"}
            </Text>

            {mostrarRegistro ? (
              <View style={styles.registerCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de usuario"
                  placeholderTextColor="#94A3B8"
                  value={nombreUsuario}
                  onChangeText={setNombreUsuario}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#94A3B8"
                  value={correoRegistro}
                  onChangeText={setCorreoRegistro}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={passwordRegistro}
                  onChangeText={setPasswordRegistro}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={confirmarPasswordRegistro}
                  onChangeText={setConfirmarPasswordRegistro}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={registrarNuevoUsuario}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMostrarRegistro(false)}>
                  <Text style={styles.linkText}>Volver a iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Correo electrónico"
                  placeholderTextColor="#94A3B8"
                  value={correo}
                  onChangeText={setCorreo}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={iniciarSesion}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setMostrarRegistro(true)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.secondaryButtonText}>Registrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.footer}>Sistema de Gestión de Activos v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    padding: 20,
  },

  keyboardView: {
    flex: 1,
    justifyContent: "center",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },

  backgroundGlow: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(37, 99, 235, 0.25)",
  },

  backgroundGlowSecondary: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(15, 118, 110, 0.2)",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  brandBadge: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  logo: {
    fontSize: 36,
    textAlign: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0F172A",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 24,
    marginTop: 6,
    fontSize: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
    fontSize: 15,
  },

  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  secondaryButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 8,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#0F172A",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  registerCard: {
    marginTop: 6,
    marginBottom: 6,
  },

  linkText: {
    color: "#2563EB",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
    fontSize: 14,
  },

  footer: {
    textAlign: "center",
    marginTop: 22,
    color: "#CBD5E1",
    fontSize: 12,
  },
});