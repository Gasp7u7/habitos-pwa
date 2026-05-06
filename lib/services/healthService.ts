'use client';
import { Health } from '@capgo/capacitor-health';
import { useAppStore } from '@/lib/store';
import { Capacitor } from '@capacitor/core';

export const HealthService = {
  isNative: () => Capacitor.isNativePlatform(),

  requestPermissions: async () => {
    if (!HealthService.isNative()) return false;
    
    try {
      const result = await Health.requestAuthorization({
        read: ['steps', 'calories', 'workouts']
      });
      return result.readAuthorized.length > 0;
    } catch (e) {
      console.error('Error requesting health permissions:', e);
      return false;
    }
  },

  syncTodayData: async () => {
    if (!HealthService.isNative()) return;

    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = now.toISOString();

      // 1. Fetch Steps
      const stepsResult = await Health.queryAggregated({
        dataType: 'steps',
        startDate: startOfDay,
        endDate: endOfDay,
        bucket: 'day'
      });
      
      const totalSteps = stepsResult.samples.reduce((acc, curr) => acc + curr.value, 0);

      // 2. Fetch Calories
      const caloriesResult = await Health.queryAggregated({
        dataType: 'calories',
        startDate: startOfDay,
        endDate: endOfDay,
        bucket: 'day'
      });
      
      const totalCalories = caloriesResult.samples.reduce((acc, curr) => acc + curr.value, 0);

      // 3. Update Store (assuming we add these fields to the store or use existing ones)
      const state = useAppStore.getState();
      
      // We could add a 'syncHealthData' action to the store later
      console.log('Synced Health Data:', { totalSteps, totalCalories });
      
      return { totalSteps, totalCalories };
    } catch (e) {
      console.error('Error syncing health data:', e);
    }
  }
};
