let alarms = [];

self.addEventListener('message', (event) => {
    if (event.data.type === 'SYNC_ALARMS') {
        alarms = event.data.alarms;
    }
});

// Check every minute in the background
setInterval(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (alarms.includes(now)) {
        self.registration.showNotification("DRINK WATER, SHUMAIM! 💧", {
            body: "Tap to hear your voice reminder!",
            icon: "https://cdn-icons-png.flaticon.com/512/3105/3105807.png",
            vibrate: [500, 100, 500],
            tag: 'hydration-alarm',
            requireInteraction: true // Keep notification there until tapped
        });
    }
}, 60000);

// When Shumaim taps the notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If the app is open, focus it
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    return client.postMessage({ action: 'playAlarm' });
                }
            }
            // If app is closed, open it and then play voice
            if (clients.openWindow) {
                return clients.openWindow('/').then(windowClient => {
                    // Small delay to ensure app loads before speaking
                    setTimeout(() => {
                        windowClient.postMessage({ action: 'playAlarm' });
                    }, 1500);
                });
            }
        })
    );
});