import { f7 } from 'framework7-react';

export function notifyWaterAdded(amountMl: number) {
  if (typeof window === 'undefined' || !f7 || !f7.toast) return;
  f7.toast.create({
    text: `¡Agregaste ${amountMl}ml de agua!`,
    closeTimeout: 2000,
    position: 'top',
    cssClass: 'font-bold text-sm bg-blue-500 text-white',
  }).open();
}

export function notifyMealAdded(name: string) {
  if (typeof window === 'undefined' || !f7 || !f7.toast) return;
  f7.toast.create({
    text: `Registraste: ${name}`,
    closeTimeout: 2000,
    position: 'top',
    cssClass: 'font-bold text-sm bg-green-500 text-white',
  }).open();
}

export function notifyWeightSaved(kg: number) {
  if (typeof window === 'undefined' || !f7 || !f7.toast) return;
  f7.toast.create({
    text: `Peso guardado: ${kg} kg`,
    closeTimeout: 2000,
    position: 'top',
    cssClass: 'font-bold text-sm bg-indigo-500 text-white',
  }).open();
}

export function notifyFastingComplete(hours: number) {
  if (typeof window === 'undefined' || !f7 || !f7.notification) return;
  f7.notification.create({
    title: 'Hábitos',
    titleRightText: 'ahora',
    subtitle: '¡Ayuno Completado!',
    text: `Completaste tu ayuno de ${hours}h. Ya puedes comer.`,
    closeOnClick: true,
    closeTimeout: 6000,
  }).open();
}

export function notifyFriendActivity(name: string, type: string) {
  if (typeof window === 'undefined' || !f7 || !f7.notification) return;
  f7.notification.create({
    icon: '<i class="f7-icons text-purple-500">flame_fill</i>',
    title: 'Actividad en tu grupo',
    subtitle: name,
    text: `Acaba de completar ${type}!`,
    closeTimeout: 4000,
  }).open();
}

export function notifyWaterReminder(currentMl: number, goalMl: number) {
  if (typeof window === 'undefined' || !f7 || !f7.notification) return;
  f7.notification.create({
    title: 'Hidratación',
    subtitle: 'Recordatorio de agua',
    text: `Llevas ${(currentMl / 1000).toFixed(1)}L de ${(goalMl / 1000).toFixed(1)}L. ¡Toma un vaso!`,
    closeOnClick: true,
    closeTimeout: 5000,
  }).open();
}
