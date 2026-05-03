import { createClient } from '@/lib/supabase/client';
import { ActivityEntry } from '@/lib/types';

export async function createActivityLog(activity: ActivityEntry) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Insert activity log
  const { data: activityLog, error: actError } = await (supabase.from('activity_logs') as any).insert({
    user_id: user.id,
    type: activity.type,
    source: activity.source,
    status: activity.status,
    started_at: activity.startedAt,
    ended_at: activity.endedAt,
    duration_seconds: activity.durationSeconds,
    distance_meters: activity.distanceMeters,
    avg_pace_seconds_per_km: activity.avgPaceSecondsPerKm,
    avg_speed_kmh: activity.avgSpeedKmh,
    estimated_calories: activity.estimatedCalories || Math.floor(activity.durationSeconds * 0.1),
    elevation_gain_meters: activity.elevationGainMeters,
    perceived_effort: activity.perceivedEffort,
    mood: activity.mood,
    notes: activity.notes,
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

    await (supabase.from('gps_routes') as any).insert({
      user_id: user.id,
      activity_id: activityLog.id,
      route_geojson: routeGeojson,
      total_points: activity.route.length,
      distance_km: activity.distanceMeters / 1000,
      duration_seconds: activity.durationSeconds,
      start_point: routeGeojson.coordinates[0],
      end_point: routeGeojson.coordinates[routeGeojson.coordinates.length - 1],
    });
  }

  return activityLog;
}
