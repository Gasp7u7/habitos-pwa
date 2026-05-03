export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          height_cm: number | null
          weight_kg: number | null
          primary_goal: string | null
          diet_type: string | null
          fasting_schedule: string | null
          daily_water_ml: number | null
          daily_calories: number | null
          daily_activity_minutes: number | null
          glass_size_ml: number | null
          has_completed_onboarding: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string
          avatar_url?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          primary_goal?: string | null
          diet_type?: string | null
          fasting_schedule?: string | null
          daily_water_ml?: number | null
          daily_calories?: number | null
          daily_activity_minutes?: number | null
          glass_size_ml?: number | null
          has_completed_onboarding?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          primary_goal?: string | null
          diet_type?: string | null
          fasting_schedule?: string | null
          daily_water_ml?: number | null
          daily_calories?: number | null
          daily_activity_minutes?: number | null
          glass_size_ml?: number | null
          has_completed_onboarding?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          body_fat_percentage: number | null
          logged_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          weight_kg: number
          body_fat_percentage?: number | null
          logged_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          weight_kg?: number
          body_fat_percentage?: number | null
          logged_at?: string | null
        }
      }
      water_logs: {
        Row: {
          id: string
          user_id: string
          amount_ml: number
          logged_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount_ml: number
          logged_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount_ml?: number
          logged_at?: string | null
        }
      }
      meal_logs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          meal_type: string | null
          calories: number
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          is_ai_generated: boolean | null
          ai_confidence: string | null
          logged_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          meal_type?: string | null
          calories?: number
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          is_ai_generated?: boolean | null
          ai_confidence?: string | null
          logged_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          meal_type?: string | null
          calories?: number
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          is_ai_generated?: boolean | null
          ai_confidence?: string | null
          logged_at?: string | null
          created_at?: string | null
        }
      }
      fasting_logs: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          target_hours: number
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          started_at: string
          ended_at?: string | null
          target_hours: number
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          target_hours?: number
          status?: string | null
          created_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          type: string
          source: string | null
          status: string | null
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          distance_meters: number | null
          avg_pace_seconds_per_km: number | null
          avg_speed_kmh: number | null
          estimated_calories: number | null
          elevation_gain_meters: number | null
          steps: number | null
          perceived_effort: number | null
          mood: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          source?: string | null
          status?: string | null
          started_at: string
          ended_at?: string | null
          duration_seconds?: number | null
          distance_meters?: number | null
          avg_pace_seconds_per_km?: number | null
          avg_speed_kmh?: number | null
          estimated_calories?: number | null
          elevation_gain_meters?: number | null
          steps?: number | null
          perceived_effort?: number | null
          mood?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          source?: string | null
          status?: string | null
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          distance_meters?: number | null
          avg_pace_seconds_per_km?: number | null
          avg_speed_kmh?: number | null
          estimated_calories?: number | null
          elevation_gain_meters?: number | null
          steps?: number | null
          perceived_effort?: number | null
          mood?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      gps_routes: {
        Row: {
          id: string
          user_id: string
          activity_id: string | null
          route_geojson: any
          total_points: number | null
          distance_km: number | null
          duration_seconds: number | null
          bounds: any | null
          start_point: any | null
          end_point: any | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          activity_id?: string | null
          route_geojson: any
          total_points?: number | null
          distance_km?: number | null
          duration_seconds?: number | null
          bounds?: any | null
          start_point?: any | null
          end_point?: any | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string | null
          route_geojson?: any
          total_points?: number | null
          distance_km?: number | null
          duration_seconds?: number | null
          bounds?: any | null
          start_point?: any | null
          end_point?: any | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
