import { createClient } from './client';
import { Database } from './types';

type WaterRow = Database['public']['Tables']['water_logs']['Row'];
type MealRow = Database['public']['Tables']['meal_logs']['Row'];
type FastingRow = Database['public']['Tables']['fasting_logs']['Row'];

// AGUA
export async function insertWaterLog(userId: string, amountMl: number) {
  const supabase = createClient();
  return (supabase.from('water_logs') as any).insert({
    user_id: userId,
    amount_ml: amountMl,
    logged_at: new Date().toISOString(),
  });
}

export async function deleteWaterLog(supabaseId: string) {
  const supabase = createClient();
  return supabase.from('water_logs').delete().eq('id', supabaseId);
}

// COMIDAS
export async function insertMealLog(userId: string, meal: any) {
  const supabase = createClient();
  return (supabase.from('meal_logs') as any).insert({
    user_id: userId,
    name: meal.name,
    calories: meal.calories,
    protein_g: meal.protein,
    carbs_g: meal.carbs,
    fat_g: meal.fat,
    is_ai_generated: meal.isAiGenerated,
    logged_at: new Date().toISOString(),
  });
}

export async function deleteMealLog(supabaseId: string) {
  const supabase = createClient();
  return supabase.from('meal_logs').delete().eq('id', supabaseId);
}

// AYUNO
export async function insertFastingLog(userId: string, targetHours: number) {
  const supabase = createClient();
  return (supabase.from('fasting_logs') as any).insert({
    user_id: userId,
    started_at: new Date().toISOString(),
    target_hours: targetHours,
    status: 'active',
  }).select().single();
}

export async function endFastingLog(supabaseId: string, status: 'completed' | 'early') {
  const supabase = createClient();
  return (supabase.from('fasting_logs') as any).update({
    ended_at: new Date().toISOString(),
    status,
  }).eq('id', supabaseId);
}

// CARGAR DATOS DEL DÍA
export async function getTodayLogs(userId: string): Promise<{ water: WaterRow[] | null, meals: MealRow[] | null, fasting: FastingRow | null }> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const [water, meals, fasting] = await Promise.all([
    supabase.from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lte('logged_at', `${today}T23:59:59`),
    supabase.from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', `${today}T00:00:00`)
      .lte('logged_at', `${today}T23:59:59`),
    supabase.from('fasting_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle(),
  ]);

  return { water: water.data, meals: meals.data, fasting: fasting.data };
}

export async function getRecentActivities(userId: string, limit = 20): Promise<{ data: any[] | null }> {
  const supabase = createClient();
  return supabase
    .from('activity_logs')
    .select('*, gps_routes(route_geojson, bounds)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit);
}
