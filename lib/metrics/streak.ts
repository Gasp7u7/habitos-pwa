import { differenceInCalendarDays, parseISO } from 'date-fns';
import { ActivityEntry } from '../types';

export function calculateStreak(activities: ActivityEntry[]): number {
  if (!activities.length) return 0;
  
  const sortedDays = [...new Set(
    activities.map(a => a.startedAt.split('T')[0])
  )].sort().reverse();
  
  let streak = 0;
  let currentDate = new Date();
  // Set current date to start of day for accurate calculation
  currentDate.setHours(0, 0, 0, 0);

  for (const day of sortedDays) {
    const dayDate = parseISO(day);
    dayDate.setHours(0, 0, 0, 0);
    const diff = differenceInCalendarDays(currentDate, dayDate);
    
    // allow today (diff 0) or yesterday (diff 1) to continue the streak
    if (diff === streak || (streak === 0 && diff === 1)) {
      streak++;
      currentDate = dayDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= 7 * 24 * 60 * 60 * 1000;
}

export function isLastWeek(date: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff > 7 * 24 * 60 * 60 * 1000 && diff <= 14 * 24 * 60 * 60 * 1000;
}

export function average(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
