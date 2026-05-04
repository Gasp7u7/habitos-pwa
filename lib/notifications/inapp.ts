import { f7 } from 'framework7-react';

export function notifyWaterAdded(amountMl: number) {
  if (!f7) return;
  f7.toast.create({
    text: `¡Agregaste ${amountMl}ml de agua!`,
    closeTimeout: 2000,
    position: 'top',
    cssClass: 'font-bold text-sm bg-blue-500 text-white',
  }).open();
}

export function notifyMealAdded(name: string) {
  if (!f7) return;
  f7.toast.create({
    text: `Registraste: ${name}`,
    closeTimeout: 2000,
    position: 'top',
    cssClass: 'font-bold text-sm bg-green-500 text-white',
  }).open();
}

export function notifyWeightSaved(kg: number) {
  if (!f7) return;
  f7.toast.create({
    text: `Peso guardado: ${kg}kg`,
    closeTimeout: 2000,
    position: 'top',
    cssClass: 'font-bold text-sm bg-indigo-500 text-white',
  }).open();
}

export function notifyFastingComplete(hours: number) {
  if (!f7) return;
  f7.notification.create({
    icon: '<i class="f7-icons text-[#D4F87A]">sparkles</i>',
    title: '¡Ayuno Completado!',
    titleRightText: 'ahora',
    subtitle: `${hours} horas de ayuno`,
    text: 'Excelente trabajo manteniendo tu objetivo.',
    closeTimeout: 4000,
  }).open();
}

export function notifyFriendActivity(name: string, type: string) {
  if (!f7) return;
  f7.notification.create({
    icon: '<i class="f7-icons text-purple-500">flame_fill</i>',
    title: 'Actividad en tu grupo',
    subtitle: name,
    text: `Acaba de completar ${type}!`,
    closeTimeout: 4000,
  }).open();
}
