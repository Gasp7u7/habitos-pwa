// lib/notifications/push.ts
// Implementar en V2 con Web Push API + Service Worker

export async function requestPushPermission(): Promise<boolean> {
  // TODO V2: solicitar permiso de notificaciones nativas
  // y registrar el subscription en Supabase tabla push_subscriptions
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPush(userId: string): Promise<void> {
  // TODO V2: registrar service worker y guardar subscription en Supabase
  console.log('[Push V2] subscribeToPush pendiente para usuario:', userId);
}

export async function sendPushToGroup(groupId: string, message: string): Promise<void> {
  // TODO V2: enviar push a todos los miembros del grupo
  console.log('[Push V2] sendPushToGroup pendiente');
}
