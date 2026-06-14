// src/push-client.js
const VAPID_PUBLIC_KEY = 'BJoDg0JBVfUl6itqP6Nx3h9pb6T4-lGCeSfV_Nc5JjVW767zxgWH8NNYudFoV4fRnU2vpIZrCEEcMattDckRIpw';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.register('./service-worker.js');
}

export async function enablePush() {
  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Benachrichtigung nicht erlaubt');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  return JSON.stringify(sub);
}
