import { createClient } from '@/lib/supabase/client';
import { ActivityEntry } from '@/lib/types';
import { calculateDailyConsistency } from '@/lib/metrics/consistency';

export async function createActivityLog(activity: ActivityEntry, organizationId?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let activeOrgId = organizationId;
  if (!activeOrgId) {
     const { data: orgMember } = await supabase.from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
     if (orgMember) activeOrgId = orgMember.organization_id;
  }
  
  if (!activeOrgId) return null;

  const today = new Date().toISOString().split('T')[0];
  const activityDurationMin = Math.round(activity.durationSeconds / 60);

  // 1. Insert activity log
  const { data: activityLog, error: actError } = await supabase.from('activity_logs').insert({
    user_id: user.id,
    organization_id: activeOrgId,
    activity_type: activity.type,
    source: activity.source,
    duration_minutes: activityDurationMin,
    distance_km: activity.distanceMeters / 1000,
    calories_burned: activity.estimatedCalories || Math.floor(activity.durationSeconds * 0.1),
    activity_date: today,
    notes: activity.notes,
    average_pace_seconds_per_km: activity.avgPaceSecondsPerKm,
    average_speed_kmh: activity.avgSpeedKmh,
    started_at: activity.startedAt,
    ended_at: activity.endedAt,
  }).select().single();

  if (actError || !activityLog) {
    console.error('Error creating activity log', actError);
    // Silent fail for now, relies on offline fallback
    return null;
  }

  // 2. Insert GPS route if applicable
  if (activity.route && activity.route.length >= 2) {
    const routeGeojson = {
      type: 'LineString',
      coordinates: activity.route.map(p => [p.longitude, p.latitude]) // [lng, lat]
    };

    await supabase.from('gps_routes').insert({
      user_id: user.id,
      organization_id: activeOrgId,
      activity_id: activityLog.id,
      route_geojson: routeGeojson,
      total_points: activity.route.length,
      filtered_points: activity.route.length,
      distance_km: activity.distanceMeters / 1000,
      duration_seconds: activity.durationSeconds,
      start_point: routeGeojson.coordinates[0],
      end_point: routeGeojson.coordinates[routeGeojson.coordinates.length - 1],
    });
  }

  // 3. Update or Insert Daily Log
  const { data: existingLog } = await supabase.from('daily_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('organization_id', activeOrgId)
    .eq('log_date', today)
    .maybeSingle();

  if (existingLog) {
    const movementMinutes = (existingLog.movement_minutes || 0) + activityDurationMin;
    const workoutCount = (existingLog.workout_count || 0) + 1;
    
    const consistencyScore = calculateDailyConsistency({
      hasWeight: !!existingLog.weight_kg,
      hasBodyFat: !!existingLog.body_fat_percentage,
      hasMeal: (existingLog.calories_consumed || 0) > 0,
      hasCalories: (existingLog.calories_consumed || 0) > 0,
      workoutDone: true,
      movementMinutes,
    });

    await supabase.from('daily_logs').update({
      workout_done: true,
      workout_count: workoutCount,
      movement_minutes: movementMinutes,
      consistency_score: consistencyScore,
      updated_at: new Date().toISOString()
    }).eq('id', existingLog.id);
  } else {
    const consistencyScore = calculateDailyConsistency({
      hasWeight: false,
      hasBodyFat: false,
      hasMeal: false,
      hasCalories: false,
      workoutDone: true,
      movementMinutes: activityDurationMin,
    });

    await supabase.from('daily_logs').insert({
      user_id: user.id,
      organization_id: organizationId,
      log_date: today,
      workout_done: true,
      workout_count: 1,
      movement_minutes: activityDurationMin,
      consistency_score: consistencyScore,
    });
  }

  return activityLog;
}
