import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import api from "../services/api";
import {
    escucharNotificaciones,
    registrarNavegador,
} from "../services/firebase";

export default function NotificacionesScreen() {
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const [enviandoPrueba, setEnviandoPrueba] = useState(false);

  // Escuchar notificaciones cuando la aplicación está abierta
  useEffect(() => {
    let cancelarEscucha = () => {};
    let desmontado = false;

    escucharNotificaciones((payload) => {
      const titulo =
        payload.data?.titulo || "Gestión de Activos";

      const cuerpo =
        payload.data?.cuerpo || "Tienes una nueva notificación.";

      setMensaje(`${titulo}: ${cuerpo}`);

      // Mostrar notificación en Chrome cuando la aplicación está abierta
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(titulo, {
          body: cuerpo,
          icon: "/favicon.ico",
        });
      }
    })
      .then((unsubscribe) => {
        if (desmontado) {
          unsubscribe();
        } else {
          cancelarEscucha = unsubscribe;
        }
      })
      .catch((error) => {
        console.error("Error al escuchar notificaciones:", error);
      });

    return () => {
      desmontado = true;
      cancelarEscucha();
    };
  }, []);

  // Activar notificaciones y registrar token en el backend
  const activarNotificaciones = async () => {
    try {
      setCargando(true);
      setMensaje("Solicitando permiso al navegador...");

      // Obtener token de Firebase
      const tokenFCM = await registrarNavegador();

      setMensaje("Registrando dispositivo en el servidor...");

      // Enviar token al backend.
      // api agrega automáticamente el JWT mediante su interceptor.
      await api.post("/notificaciones/registrar-token", {
        token_fcm: tokenFCM,
        plataforma: "web",
      });

      setRegistrado(true);

      setMensaje(
        "¡Notificaciones activadas y dispositivo registrado correctamente!"
      );
    } catch (error: any) {
      console.error("Error al activar notificaciones:", error);

      const mensajeError =
        error?.response?.data?.mensaje ||
        error?.message ||
        "No se pudieron activar las notificaciones.";

      setMensaje(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  // Solicitar una notificación de prueba al backend
  const enviarPrueba = async () => {
    try {
      setEnviandoPrueba(true);
      setMensaje("Enviando notificación de prueba...");

      const respuesta = await api.post("/notificaciones/prueba");

      setMensaje(
        `${respuesta.data.mensaje} Enviadas: ${respuesta.data.enviados}. Fallidas: ${respuesta.data.fallidos}.`
      );
    } catch (error: any) {
      console.error("Error al enviar prueba:", error);

      setMensaje(
        error?.response?.data?.mensaje ||
          error?.message ||
          "No se pudo enviar la notificación de prueba."
      );
    } finally {
      setEnviandoPrueba(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notificaciones Push</Text>

      <Text style={styles.description}>
        Activa las notificaciones para recibir avisos del Sistema
        de Gestión de Activos.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={activarNotificaciones}
        disabled={cargando}
      >
        <Text style={styles.buttonText}>
          {cargando
            ? "Activando..."
            : "Activar notificaciones"}
        </Text>
      </TouchableOpacity>

      {registrado && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            ✓ Este navegador está registrado para recibir notificaciones.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          styles.testButton,
          !registrado && styles.disabledButton,
        ]}
        onPress={enviarPrueba}
        disabled={!registrado || enviandoPrueba}
      >
        <Text style={styles.buttonText}>
          {enviandoPrueba
            ? "Enviando..."
            : "Enviar notificación de prueba"}
        </Text>
      </TouchableOpacity>

      {mensaje !== "" && (
        <Text style={styles.message}>{mensaje}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 25,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  testButton: {
    backgroundColor: "#15803D",
  },

  disabledButton: {
    backgroundColor: "#94A3B8",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  message: {
    marginTop: 15,
    color: "#0F172A",
  },

  successContainer: {
    backgroundColor: "#DCFCE7",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  successText: {
    color: "#166534",
    fontWeight: "600",
  },
});