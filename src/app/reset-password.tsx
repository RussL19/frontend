import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { resetPassword } from "../services/authService";

export default function ResetPassword() {

  const router = useRouter();

  const { token } = useLocalSearchParams();

  const [password, setPassword] = useState("");

  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");

  const [exito, setExito] = useState("");

  const cambiarPassword = async () => {
    setError("");

    if (!password || !confirmarPassword) {

      setError(
        "Complete todos los campos."
      );

      return;

    }

    if (password !== confirmarPassword) {

      setError(
        "Error. Las contraseñas no coinciden."
      );

      return;

    }

    if (password.length < 6) {

      setError(
        "Error. La contraseña debe tener al menos 6 caracteres."
      );

      return;

    }

    try {

      setGuardando(true);

      await resetPassword(
        token as string,
        password
      );

      Alert.alert(
        "Éxito",
        "Su contraseña fue actualizada correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/")
          }
        ]
      );
      setExito(
        "Su contraseña fue actualizada correctamente."
      );

    } catch (error: any) {

      setError(
        "Error. No fue posible cambiar la contraseña."
      );

    } finally {

      setGuardando(false);

    }

  };

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.title}>
          Restablecer contraseña
        </Text>

        <Text style={styles.subtitle}>
          Escriba su nueva contraseña.
        </Text>

        <TextInput
          secureTextEntry
          placeholder="Nueva contraseña"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          secureTextEntry
          placeholder="Confirmar contraseña"
          style={styles.input}
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
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
          onPress={cambiarPassword}
          disabled={guardando}
        >

          <Text style={styles.buttonText}>

            {guardando
              ? "Actualizando..."
              : "Actualizar contraseña"}

          </Text>

        </TouchableOpacity>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#f8fafc",

    padding: 20

  },

  card: {

    width: "100%",

    maxWidth: 420,

    backgroundColor: "#fff",

    padding: 25,

    borderRadius: 16,

    elevation: 4

  },

  title: {

    fontSize: 24,

    fontWeight: "bold",

    textAlign: "center",

    marginBottom: 10

  },

  subtitle: {

    textAlign: "center",

    color: "#64748B",

    marginBottom: 25

  },

  input: {

    borderWidth: 1,

    borderColor: "#CBD5E1",

    borderRadius: 8,

    padding: 14,

    marginBottom: 15

  },

  button: {

    backgroundColor: "#2563EB",

    padding: 15,

    borderRadius: 8

  },

  buttonText: {

    color: "#fff",

    textAlign: "center",

    fontWeight: "bold",

    fontSize: 16

  }

});