
import { initializeApp } from "firebase/app";
import {
    getMessaging,
    getToken,
    isSupported,
    Messaging,
    onMessage,
    type MessagePayload,
} from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCSdy7DQ-eXwJ5A4RcXkAABWXDibZ8j64M",
    authDomain: "sistema-gestion-activos-c1d51.firebaseapp.com",
    projectId: "sistema-gestion-activos-c1d51",
    storageBucket: "sistema-gestion-activos-c1d51.firebasestorage.app",
    messagingSenderId: "460036394369",
    appId: "1:460036394369:web:98a1d1756c359048d0ac80",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const obtenerMessaging = async (): Promise<Messaging | null> => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const compatible = await isSupported();

        if (!compatible) {
            return null;
        }

        return getMessaging(firebaseApp);
    } catch (error) {
        console.error("Error al inicializar Firebase Messaging:", error);
        return null;
    }
};

export const VAPID_KEY =
    "BEN3iJMpRCbAh96Rve-pYSAv4UTi2yTct94a4IKO7g_96T09RCE_TmPbUQKZ6vnvjeeS5gOShPBG8ho48T8THtw";




export const registrarNavegador = async (): Promise<string> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
        throw new Error("Este navegador no admite notificaciones.");
    }

    if (!("serviceWorker" in navigator)) {
        throw new Error("El navegador no admite Service Workers.");
    }

    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
        throw new Error("No se concedió permiso para recibir notificaciones.");
    }

    const messaging = await obtenerMessaging();

    if (!messaging) {
        throw new Error("Firebase Messaging no está disponible.");
    }

    const registro = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    );

    await navigator.serviceWorker.ready;

    if (!registro.active) {
        throw new Error("El Service Worker todavía no está activo.");
    }

    const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registro,
    });
    if (!token) {
        throw new Error("No se pudo obtener el token de Firebase.");
    }

    console.log("Token FCM obtenido:", token);

    return token;
};

export const escucharNotificaciones = async (
    callback: (payload: MessagePayload) => void
) => {
    const messaging = await obtenerMessaging();

    if (!messaging) {
        throw new Error("Firebase Messaging no está disponible.");
    }

    return onMessage(messaging, callback);
};
