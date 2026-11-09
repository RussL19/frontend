import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { login, recuperarPassword, register, verificarCodigoLogin } from "../services/authService";
export default function LoginScreen() {

  const [correo, setCorreo] = useState("");  // Estado para almacenar el correo electrónico ingresado por el usuario
  const [password, setPassword] = useState("");  // Estado para almacenar el correo electrónico ingresado por el usuario
  const [mostrarPerfil, setMostrarPerfil] = useState(false); // Estado para controlar si se muestra la pantalla de perfil o no
  const [mostrarRegistro, setMostrarRegistro] = useState(false);  // Estado para controlar si se muestra la pantalla de registro o la de inicio de sesión
  const [nombreUsuario, setNombreUsuario] = useState("");  // Estado para almacenar el nombre de usuario durante el registro
  const [correoRegistro, setCorreoRegistro] = useState("");  // Estado para almacenar el correo durante el registro
  const [passwordRegistro, setPasswordRegistro] = useState("");  // Estado para almacenar la contraseña durante el registro
  const [confirmarPasswordRegistro, setConfirmarPasswordRegistro] = useState("");  // Estado para almacenar la confirmación de la contraseña durante el registro
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [requiere2FA, setRequiere2FA] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [codigo2FA, setCodigo2FA] = useState("");
  const [mostrarPoliticas, setMostrarPoliticas] = useState(false);

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


  const iniciarSesion = async () => {
    setError("");
    // 1. Validar campos vacíos
    if (!correo.trim() && !password) {
      setError(
        "Por favor, ingrese su correo electrónico y contraseña."
      );
      return;
    }

    if (!correo.trim()) {
      setError(
        "Por favor, ingrese su correo electrónico."
      );
      return;
    }

    if (!password) {
      setError(
        "Por favor, ingrese su contraseña."
      );
      return;
    }

    // 2. Validar formato del correo
    const correoLimpio = correo.trim();
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoLimpio)) {
      setError(
        "Correo inválido"
      );
      return;
    }

    try {
      const respuesta = await login({
        correo: correoLimpio,
        password,
      });

      
      // Si el usuario tiene doble factor activado
      if (respuesta.requiere2FA) {
        if (!respuesta.challengeToken) {
          setError("No se recibió el token de verificación.");
          return;
        }

        setChallengeToken(respuesta.challengeToken);
        setRequiere2FA(true);
        setCodigo2FA("");
        setError("");
        setExito("");

        return;
      }

      if (respuesta.requiere2FA) {
        setError("Debes completar la verificación de Google Authenticator.");
        return;
      }

      if (!respuesta.token || !respuesta.usuario) {
        setError("Respuesta de inicio de sesión incompleta.");
        return;
      }

      // Guardar el token definitivo
      await AsyncStorage.setItem("token", respuesta.token);

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.usuario)
      );

      await AsyncStorage.setItem(
        "id_rol",
        respuesta.usuario.id_rol.toString()
      );


      setMostrarPerfil(true);

      setExito("Éxito. Inicio de sesión correcto.");

      router.replace("/home");
    } catch (error: any) {
      const status = error.response?.status;
      const mensaje = error.response?.data?.mensaje;

      console.log("Error de inicio de sesión:", mensaje || error.message);

      // 3. Credenciales incorrectas
      if (status === 401) {
        setError(
          "Inicio de sesión fallido. El correo electrónico o la contraseña son incorrectos."
        );
        return;
      }

      // 4. Error de conexión
      if (!error.response) {
        setError(
          "Error de conexión. No se pudo conectar con el servidor. Verifique su conexión e inténtelo nuevamente."
        );
        return;
      }

      // 5. Otros errores del servidor
      setError(
        mensaje || "Ocurrió un problema al iniciar sesión. Inténtelo nuevamente."
      );
    }
  };


  const verificar2FA = async () => {
    setError("");
    setExito("");

    if (!codigo2FA.trim()) {
      setError("Ingresa el código de Google Authenticator.");
      return;
    }

    if (!/^\d{6}$/.test(codigo2FA.trim())) {
      setError("El código debe contener seis dígitos.");
      return;
    }

    try {
      const respuesta = await verificarCodigoLogin({
        challengeToken,
        codigo: codigo2FA.trim(),
      });

      if (!respuesta.token || !respuesta.usuario) {
        setError("No se recibió una sesión válida.");
        return;
      }

      // Guardar únicamente el token definitivo
      await AsyncStorage.setItem("token", respuesta.token);

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.usuario)
      );

      await AsyncStorage.setItem(
        "id_rol",
        respuesta.usuario.id_rol.toString()
      );

      setRequiere2FA(false);
      setChallengeToken("");
      setCodigo2FA("");
      setMostrarPerfil(true);

      setExito("Autenticación completada correctamente.");

      router.replace("/home");

    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje;

      setError(
        mensaje || "Código incorrecto o expirado. Inténtalo nuevamente."
      );
    }
  };



  const registrarNuevoUsuario = async () => {   // Función que maneja el registro de un nuevo usuario, validando los campos y enviando los datos al backend o guardándolos localmente si el backend no está disponible
    if (!nombreUsuario.trim() || !correoRegistro.trim() || !passwordRegistro.trim() || !confirmarPasswordRegistro.trim()) {
      setError("Campos requeridos. Completa todos los campos para registrar un usuario");
      return;
    }

    if (passwordRegistro !== confirmarPasswordRegistro) {
      setError("Error. Las contraseñas no coinciden");
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

      setExito(mensajeFinal);
      router.replace("/home");
    } catch (error: any) {
      setError("No se pudo registrar. Inténtalo nuevamente.");
    }
  };

  const recuperarContrasena = async () => {

    if (!correo.trim()) {
      setError(
        "Correo requerido. Ingrese su correo electrónico."
      );
      return;
    }

    try {

      await recuperarPassword(correo);

      setError(
        "Éxito. Si el correo existe, se ha enviado un enlace para recuperar la contraseña."
      );


    } catch (error: any) {
      console.log("====================");
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      console.log("====================");

      console.log(error);

      setError(
        "Error. No fue posible enviar el correo."
      );

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
              <Text style={styles.logo}>💻</Text>
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
            ) : requiere2FA ? (
              <View style={styles.registerCard}>
                <Text style={styles.title}>Verificación en dos pasos</Text>

                <Text style={styles.subtitle}>
                  Abre Google Authenticator e introduce el código de seis dígitos
                  para continuar.
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor="#94A3B8"
                  value={codigo2FA}
                  onChangeText={(texto) =>
                    setCodigo2FA(texto.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />

                {error !== "" && (
                  <View
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderColor: "#FECACA",
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 12,
                      marginTop: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: "#B91C1C", fontSize: 13 }}>
                      {error}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={verificar2FA}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>Verificar código</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setRequiere2FA(false);
                    setChallengeToken("");
                    setCodigo2FA("");
                    setError("");
                    setPassword("");
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#2563EB",
                      marginTop: 15,
                      fontWeight: "600",
                    }}
                  >
                    Volver al inicio de sesión
                  </Text>
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

                {error !== "" && (
                  <View
                    style={{
                      backgroundColor: "#FEF2F2",
                      borderColor: "#FECACA",
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 12,
                      marginTop: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: "#B91C1C", fontSize: 13 }}>
                      {error}
                    </Text>
                  </View>
                )}

                {exito !== "" && (
                  <View
                    style={{
                      backgroundColor: "#d0feca",
                      borderColor: "#d0feca",
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 12,
                      marginTop: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ color: "#31bd70", fontSize: 13 }}>
                      {exito}
                    </Text>
                  </View>
                )}

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

                <TouchableOpacity onPress={recuperarContrasena}>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#2563EB",
                      marginTop: 15,
                      fontWeight: "600",
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <TouchableOpacity onPress={() => setMostrarPoliticas(true)}>
            <Text style={styles.privacyLink}>Políticas de privacidad</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Sistema de Gestión de Activos v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={mostrarPoliticas}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarPoliticas(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Políticas de privacidad</Text>
              <TouchableOpacity onPress={() => setMostrarPoliticas(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                Esta aplicación recopila únicamente la información necesaria para la gestión de activos, usuarios y asignaciones dentro del sistema.
              </Text>
              <Text style={styles.modalText}>
                Los datos personales, como correo, nombre de usuario y datos de acceso, se utilizan para autenticar al usuario y permitir el uso correcto de la plataforma.
              </Text>
              <Text style={styles.modalText}>
                La información se guarda de forma segura y se emplea exclusivamente para la operación del sistema, control de inventario, asignaciones y reportes autorizados por la administración.
              </Text>
              <Text style={styles.modalText}>
                No se compartirán datos con terceros sin consentimiento explícito, salvo obligación legal o requerimiento institucional autorizado.
              </Text>
              <Text style={styles.modalText}>
                El usuario puede solicitar la revisión o actualización de su información contactando al administrador del sistema.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  privacyLink: {
    textAlign: "center",
    color: "#2563EB",
    marginTop: 16,
    fontWeight: "600",
    fontSize: 13,
  },

  footer: {
    textAlign: "center",
    marginTop: 12,
    color: "#CBD5E1",
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  closeButtonText: {
    fontSize: 20,
    color: "#334155",
    fontWeight: "700",
  },

  modalContent: {
    maxHeight: 360,
  },

  modalText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 12,
  },
});