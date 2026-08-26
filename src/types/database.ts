export type UserRole = "admin" | "client";
export type ProfileStatus = "pending" | "active" | "suspended";
export type EntityStatus = "active" | "suspended";

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          company_name: string;
          client_code: string | null;
          status: EntityStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          client_code?: string | null;
          status?: EntityStatus;
          created_at?: string;
        };
        Update: {
          company_name?: string;
          client_code?: string | null;
          status?: EntityStatus;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          requested_company_name: string | null;
          role: UserRole;
          client_id: string | null;
          status: ProfileStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          requested_company_name?: string | null;
          role?: UserRole;
          client_id?: string | null;
          status?: ProfileStatus;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          requested_company_name?: string | null;
          role?: UserRole;
          client_id?: string | null;
          status?: ProfileStatus;
        };
        Relationships: [];
      };
      filing_periods: {
        Row: {
          id: string;
          client_id: string;
          period_year: number;
          period_month: number;
          file_path: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          period_year: number;
          period_month: number;
          file_path?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          file_path?: string | null;
          published?: boolean;
        };
        Relationships: [];
      };
      client_documents: {
        Row: {
          id: string;
          client_id: string;
          uploaded_by: string;
          original_filename: string;
          file_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          uploaded_by: string;
          original_filename: string;
          file_path: string;
          created_at?: string;
        };
        Update: {
          original_filename?: string;
          file_path?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      profile_status: ProfileStatus;
      entity_status: EntityStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
