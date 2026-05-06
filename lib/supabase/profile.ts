import { createClient } from './client';
import { Database } from './types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type ProfileUpdate = {
  display_name?: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  primary_goal?: string | null;
  goals?: string[] | null;
  diet_type?: string | null;
  fasting_schedule?: string | null;
  has_completed_onboarding?: boolean;
  daily_water_ml?: number;
  daily_calories?: number;
  daily_activity_minutes?: number;
  glass_size_ml?: number;
  age?: number | null;
  gender?: string | null;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fat_g?: number;
};

export async function getProfile(userId: string): Promise<ProfileRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<ProfileUpdate>) {
  const supabase = createClient();
  const { data, error } = await (supabase.from('profiles') as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
