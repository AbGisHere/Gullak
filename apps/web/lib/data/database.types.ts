// Generated from an isolated PostgreSQL database after applying committed migration files.
// Regenerate: node scripts/test-database.mjs <postgres-bin> --generate-types
// This is local migration evidence, not verification of the shared Supabase schema.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Database = {
  public: {
    Tables: {
      backend_commands: {
        Row: {
          learner_id: string;
          command_kind: string;
          idempotency_key: string;
          request: Json;
          result: Json;
          created_at: string;
        };
        Insert: {
          learner_id: string;
          command_kind: string;
          idempotency_key: string;
          request: Json;
          result: Json;
          created_at?: string;
        };
        Update: {
          learner_id?: string;
          command_kind?: string;
          idempotency_key?: string;
          request?: Json;
          result?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "backend_commands_learner_id_fkey";
            columns: ["learner_id"];
            isOneToOne: false;
            referencedRelation: "learners";
            referencedColumns: ["id"];
          },
        ];
      };
      cohort_facilitators: {
        Row: {
          cohort_id: string;
          facilitator_id: string;
        };
        Insert: {
          cohort_id: string;
          facilitator_id: string;
        };
        Update: {
          cohort_id?: string;
          facilitator_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cohort_facilitators_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
        ];
      };
      cohort_learners: {
        Row: {
          cohort_id: string;
          learner_id: string;
        };
        Insert: {
          cohort_id: string;
          learner_id: string;
        };
        Update: {
          cohort_id?: string;
          learner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cohort_learners_cohort_id_fkey";
            columns: ["cohort_id"];
            isOneToOne: false;
            referencedRelation: "cohorts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cohort_learners_learner_id_fkey";
            columns: ["learner_id"];
            isOneToOne: false;
            referencedRelation: "learners";
            referencedColumns: ["id"];
          },
        ];
      };
      cohorts: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
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
      learners: {
        Row: {
          id: string;
          display_name: string | null;
          age_band: string | null;
          experience: string;
          locale: string;
          preferred_formats: string[];
          goal: Json | null;
          cohort_id: string | null;
          created_at: string;
          grade_group: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          age_band?: string | null;
          experience: string;
          locale: string;
          preferred_formats: string[];
          goal?: Json | null;
          cohort_id?: string | null;
          created_at?: string;
          grade_group?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          age_band?: string | null;
          experience?: string;
          locale?: string;
          preferred_formats?: string[];
          goal?: Json | null;
          cohort_id?: string | null;
          created_at?: string;
          grade_group?: string | null;
        };
        Relationships: [];
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
      topic_progress: {
        Row: {
          learner_id: string;
          topic_id: string;
          status: string;
          best_score: number | null;
          quiz_attempts: number;
          completed_at: string | null;
          updated_at: string;
          lesson_viewed_at: string | null;
        };
        Insert: {
          learner_id: string;
          topic_id: string;
          status: string;
          best_score?: number | null;
          quiz_attempts?: number;
          completed_at?: string | null;
          updated_at?: string;
          lesson_viewed_at?: string | null;
        };
        Update: {
          learner_id?: string;
          topic_id?: string;
          status?: string;
          best_score?: number | null;
          quiz_attempts?: number;
          completed_at?: string | null;
          updated_at?: string;
          lesson_viewed_at?: string | null;
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
    };
    Views: { [_ in never]: never };
    Functions: {
      facilitator_progress: { Args: { p_facilitator: string; p_cohort: string }; Returns: Json };
      invest_fd: {
        Args: { p_learner: string; p_key: string; p_request: Json; p_holding: Json; p_requires: string[] };
        Returns: Json;
      };
      learner_state: { Args: Record<string, never>; Returns: Json };
      onboard_learner: { Args: { p_learner: string; p_profile: Json; p_cash: number }; Returns: Json };
      record_lesson: { Args: { p_learner: string; p_topic: string }; Returns: undefined };
      record_quiz: {
        Args: {
          p_learner: string;
          p_topic: string;
          p_key: string;
          p_request: Json;
          p_score: number;
          p_pass_mark: number;
          p_requires: string[];
        };
        Returns: Json;
      };
      test_assert: { Args: { ok: boolean; label: string }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
