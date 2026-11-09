
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCSdy7DQ-eXwJ5A4RcXkAABWXDibZ8j64M",
  authDomain: "sistema-gestion-activos-c1d51.firebaseapp.com",
  projectId: "sistema-gestion-activos-c1d51",
  storageBucket: "sistema-gestion-activos-c1d51.firebasestorage.app",
  messagingSenderId: "460036394369",
  appId: "1:460036394369:web:98a1d1756c359048d0ac80",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Notificación recibida desde Firebase:", payload);

  const datos = payload.data || {};

  const titulo =
    datos.titulo ||
    payload.notification?.title ||
    "Gestión de Activos";

  const cuerpo =
    datos.cuerpo ||
    payload.notification?.body ||
    "Tienes una nueva notificación.";

  self.registration.showNotification(titulo, {
    body: cuerpo,
    icon: "/favicon.ico",
    data: datos,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("/")
  );
});
