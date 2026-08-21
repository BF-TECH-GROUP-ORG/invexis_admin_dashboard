"use client";

import React, { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { useNotification } from '@/providers/NotificationProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

export function PushProvider({ children }) {
    const { data: session } = useSession();
    const { showNotification, hideNotification } = useNotification();
    const initialized = useRef(false);

    useEffect(() => {
        if (!session?.accessToken || !messaging || initialized.current) return;

        console.log('[Push] Initializing FCM...');
        initialized.current = true;

        const user = session.user;
        const token = session.accessToken;

        const setupPush = async () => {
            try {
                let deviceId = localStorage.getItem('invexis_admin_device_id');
                if (!deviceId) {
                    deviceId = `admin_web_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
                    localStorage.setItem('invexis_admin_device_id', deviceId);
                }

                const userId = user._id || user.id;
                const cachedTokenKey = `fcm_token_admin_${userId}`;
                const lastSyncKey = `fcm_last_sync_admin_${userId}`;
                const cachedToken = localStorage.getItem(cachedTokenKey);
                const lastSync = localStorage.getItem(lastSyncKey);

                const SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000;
                const needsSync = !lastSync || (Date.now() - parseInt(lastSync)) > SYNC_INTERVAL;

                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                        scope: '/'
                    });

                    const fcmToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                        serviceWorkerRegistration: registration
                    });

                    if (fcmToken) {
                        if (cachedToken === fcmToken && !needsSync) {
                            console.log('[Push] FCM Token already synced.');
                            return;
                        }

                        // Register device with backend
                        let deviceUrl = API_URL.replace(/\/+$/, "");
                        if (deviceUrl.includes('/api/auth')) {
                            deviceUrl = deviceUrl.split('/api/auth')[0] + '/api/auth/devices';
                        } else if (deviceUrl.includes('/api')) {
                            deviceUrl = deviceUrl.split('/api')[0] + '/api/auth/devices';
                        } else {
                            deviceUrl = `${deviceUrl}/auth/devices`;
                        }

                        const payload = {
                            fcmToken,
                            deviceId,
                            deviceType: 'web',
                            deviceName: `Admin Browser (${window.navigator.appName || 'Generic'})`
                        };

                        const response = await fetch(deviceUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(payload)
                        });

                        if (response.ok) {
                            console.log('[Push] Device registered successfully');
                            localStorage.setItem(cachedTokenKey, fcmToken);
                            localStorage.setItem(lastSyncKey, Date.now().toString());
                        }
                    }
                }
            } catch (err) {
                console.error('[Push] Registration failed:', err);
            }
        };

        // Foreground Message handling
        const unsubscribeFCM = onMessage(messaging, async (payload) => {
            console.log('[Push] Foreground Message:', payload);

            const title = payload.notification?.title || 'Admin Alert';
            const body = payload.notification?.body || 'New notification received';

            showNotification({
                message: body,
                severity: 'info',
                duration: 8000
            });

            // Trigger browser notification even in foreground
            try {
                const reg = await navigator.serviceWorker.ready;
                if (reg) {
                    reg.showNotification(title, {
                        body,
                        icon: '/images/Invexix Logo-Light Mode.png',
                        badge: '/images/Invexix Logo-Light Mode.png',
                    });
                }
            } catch (swErr) {
                console.warn('[Push] Browser notification failed:', swErr);
            }
        });

        // Setup if permission is already granted, otherwise wait
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                setupPush();
            } else if (Notification.permission === 'default') {
                // Show invitation logic if needed, for admin we'll just try to setup when possible
                // (Mirroring frontend logic here would be complex, let's stick to setupPush on demand)
                // For now, let's just trigger setupPush which will request permission
                setupPush();
            }
        }

        return () => {
            if (unsubscribeFCM) unsubscribeFCM();
            initialized.current = false;
        };
    }, [session, showNotification]);

    return children;
}
