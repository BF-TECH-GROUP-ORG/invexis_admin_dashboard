/*
 * Firebase Messaging Service Worker - Admin Dashboard
 */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC3QPAGkxyVR51zypdSZmBo0vdcN1-PVkU",
    projectId: "invexis-94bf5",
    messagingSenderId: "52356196460",
    appId: "1:52356196460:web:e35ec6b5358e60897a1049"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background Message received:', payload);

    const notificationTitle = payload.notification?.title || 'Invexis Admin Notification';
    const notificationOptions = {
        body: payload.notification?.body,
        icon: '/images/Invexix Logo-Light Mode.png',
        badge: '/images/Invexix Logo-Light Mode.png',
        data: payload.data || {}
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click: redirect to admin dashboard
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
