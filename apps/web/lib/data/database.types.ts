// Database types for supabase/migrations, in the shape `supabase gen types` emits.
// Hand-written for the first migration. TODO(R3): once the project is linked,
// replace this file with generated output after every migration:
//   pnpm dlx supabase gen types typescript --linked > apps/web/lib/data/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      learners: {
        Row: {
          id: string;
          display_name: string | null;
          age_band: string;
          experience: string;
          locale: string;
          preferred_formats: string[];
          goal: Json | null;
          cohort_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          age_band: string;
          experience: string;
          locale: string;
          preferred_formats: string[];
          goal?: Json | null;
          cohort_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          age_band?: string;
          experience?: string;
          locale?: string;
          preferred_formats?: string[];
          goal?: Json | null;
          cohort_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      topic_progress: {
        Row: {
          learner_id: string;
          topic_id: string;
          status: string;
          best_score: number | null;
          quiz_attempts: number;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          learner_id: string;
          topic_id: string;
          status: string;
          best_score?: number | null;
          quiz_attempts?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          learner_id?: string;
          topic_id?: string;
          status?: string;
          best_score?: number | null;
          quiz_attempts?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topic_progress_learner_id_fkey";
            columns: ["learner_id"];
            isOneToOne: false;
            referencedRelation: "learners";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolios: {
        Row: {
          id: string;
          learner_id: string;
          is_virtual: boolean;
          starting_cash_paise: number;
          cash_paise: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learner_id: string;
          is_virtual?: boolean;
          starting_cash_paise: number;
          cash_paise: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          learner_id?: string;
          is_virtual?: boolean;
          starting_cash_paise?: number;
          cash_paise?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolios_learner_id_fkey";
            columns: ["learner_id"];
            isOneToOne: true;
            referencedRelation: "learners";
            referencedColumns: ["id"];
          },
        ];
      };
      holdings: {
        Row: {
          id: string;
          portfolio_id: string;
          learner_id: string;
          type: string;
          kind: string;
          instrument_id: string;
          opened_at: string;
          details: Json;
        };
        Insert: {
          id?: string;
          portfolio_id: string;
          learner_id: string;
          type: string;
          kind: string;
          instrument_id: string;
          opened_at?: string;
          details: Json;
        };
        Update: {
          id?: string;
          portfolio_id?: string;
          learner_id?: string;
          type?: string;
          kind?: string;
          instrument_id?: string;
          opened_at?: string;
          details?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_learner_id_fkey";
            columns: ["portfolio_id", "learner_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id", "learner_id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
