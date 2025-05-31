export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      context_sources: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          source_type: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          source_type: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_content: {
        Row: {
          content: Json
          created_at: string
          document_id: string
          id: string
          raw_text: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          document_id: string
          id?: string
          raw_text?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          document_id?: string
          id?: string
          raw_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_content_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_history: {
        Row: {
          created_at: string
          document_id: string
          id: string
          message: string | null
          status: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          message?: string | null
          status: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_validations: {
        Row: {
          created_at: string | null
          details: Json | null
          document_id: string
          id: string
          rule_id: string
          status: Database["public"]["Enums"]["validation_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          document_id: string
          id?: string
          rule_id: string
          status: Database["public"]["Enums"]["validation_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          document_id?: string
          id?: string
          rule_id?: string
          status?: Database["public"]["Enums"]["validation_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_validations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_validations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "validation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          created_by: string | null
          flagged: boolean
          id: string
          last_updated: string
          progress: number
          status: string
          storage_path: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          flagged?: boolean
          id?: string
          last_updated?: string
          progress?: number
          status: string
          storage_path?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          flagged?: boolean
          id?: string
          last_updated?: string
          progress?: number
          status?: string
          storage_path?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      knowledge_vectors: {
        Row: {
          content: string
          created_at: string
          embedding: Json | null
          id: string
          metadata: Json | null
          source_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: Json | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: Json | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_vectors_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "context_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      validation_approvals: {
        Row: {
          comments: string | null
          created_at: string | null
          document_id: string
          id: string
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_issues: {
        Row: {
          created_at: string
          document_id: string
          field: string
          id: string
          issue: string
          severity: string
        }
        Insert: {
          created_at?: string
          document_id: string
          field: string
          id?: string
          issue: string
          severity: string
        }
        Update: {
          created_at?: string
          document_id?: string
          field?: string
          id?: string
          issue?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_issues_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_rules: {
        Row: {
          condition_field: string
          condition_type: string
          condition_value: string | null
          created_at: string | null
          description: string
          document_type: string
          error_message: string
          id: string
          is_active: boolean | null
          rule_code: string
          rule_name: string
          severity: Database["public"]["Enums"]["validation_severity"]
          updated_at: string | null
        }
        Insert: {
          condition_field: string
          condition_type: string
          condition_value?: string | null
          created_at?: string | null
          description: string
          document_type: string
          error_message: string
          id?: string
          is_active?: boolean | null
          rule_code: string
          rule_name: string
          severity: Database["public"]["Enums"]["validation_severity"]
          updated_at?: string | null
        }
        Update: {
          condition_field?: string
          condition_type?: string
          condition_value?: string | null
          created_at?: string | null
          description?: string
          document_type?: string
          error_message?: string
          id?: string
          is_active?: boolean | null
          rule_code?: string
          rule_name?: string
          severity?: Database["public"]["Enums"]["validation_severity"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      validation_severity: "error" | "warning" | "info"
      validation_status: "pass" | "fail" | "warning" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: ["pending", "approved", "rejected"],
      validation_severity: ["error", "warning", "info"],
      validation_status: ["pass", "fail", "warning", "pending"],
    },
  },
} as const
