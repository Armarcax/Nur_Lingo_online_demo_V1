// src/lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

// ─── DATABASE TYPES ──────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          username: string | null;
          email: string | null;
          display_name: string | null;
          cefr_level: string;
          xp_total: number;
          hayq_total: number;
          seeds_total: number;
          streak_days: number;
          streak_last_date: string | null;
          preferences: Record<string, unknown>;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: "not_started" | "in_progress" | "completed";
          score: number;
          hayq_earned: number;
          seeds_earned: number;
          attempts: number;
          completed_at: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string | null;
          user_answer: string;
          expected_answer: string;
          is_accepted: boolean;
          score: number | null;
          hayq_awarded: number;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      dictionary_entries: {
        Row: {
          id: string;
          word_id: string;
          hy: string;
          en: string;
          ru: string;
          type: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      lesson_completions: {
        Row: {
          id: string;
          device_id: string;
          lesson_id: string;
          accuracy: number;
          hayq_earned: number;
          crown_level: number;
          duration_ms: number;
          completed_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
};

// ─── ENVIRONMENT VARIABLES ──────────────────────────────────────────

// ✅ TypeScript-ին ասում ենք, որ փոփոխականները կան (կամ դատարկ են)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────

// ✅ Real client (only if credentials exist)
const realSupabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ✅ Mock client (always available, no TypeScript errors)
const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        order: (column: string, options?: { ascending?: boolean }) => ({ data: [], error: null }),
        limit: (count: number) => ({ data: [], error: null }),
        range: (start: number, end: number) => ({ data: [], error: null }),
      }),
      order: (column: string, options?: { ascending?: boolean }) => ({ data: [], error: null }),
      limit: (count: number) => ({ data: [], error: null }),
      range: (start: number, end: number) => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null }),
    }),
    insert: (values: any) => ({ data: null, error: null }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({ data: null, error: null }),
    }),
    upsert: (values: any) => ({ data: null, error: null }),
  }),
};

// ✅ Client that never returns null (mock as fallback)
export const supabase = realSupabase || mockSupabase;

export const isSupabaseAvailable = !!realSupabase;

export function getSupabaseBrowser() {
  return supabase;
}

export function getSupabaseClient() {
  return supabase;
}

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// ─── RE-EXPORT ──────────────────────────────────────────────────────

export { createClient };