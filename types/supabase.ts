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
      attendance: {
        Row: {
          created_at: string
          date: string
          hours_worked: number
          id: string
          is_weekly_holiday: boolean
          notes: string | null
          site_id: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hours_worked: number
          id?: string
          is_weekly_holiday?: boolean
          notes?: string | null
          site_id: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours_worked?: number
          id?: string
          is_weekly_holiday?: boolean
          notes?: string | null
          site_id?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          business_number: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_number?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_number?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          base_pay: number | null
          created_at: string
          employment_insurance: number | null
          health_insurance: number | null
          id: string
          income_tax: number | null
          month: number
          net_pay: number | null
          overtime_pay: number | null
          paid_at: string | null
          pension_insurance: number | null
          site_id: string
          total_deduction: number | null
          total_hours: number | null
          total_pay: number | null
          total_work_days: number | null
          updated_at: string
          weekly_holiday_pay: number | null
          worker_id: string
          year: number
        }
        Insert: {
          base_pay?: number | null
          created_at?: string
          employment_insurance?: number | null
          health_insurance?: number | null
          id?: string
          income_tax?: number | null
          month: number
          net_pay?: number | null
          overtime_pay?: number | null
          paid_at?: string | null
          pension_insurance?: number | null
          site_id: string
          total_deduction?: number | null
          total_hours?: number | null
          total_pay?: number | null
          total_work_days?: number | null
          updated_at?: string
          weekly_holiday_pay?: number | null
          worker_id: string
          year: number
        }
        Update: {
          base_pay?: number | null
          created_at?: string
          employment_insurance?: number | null
          health_insurance?: number | null
          id?: string
          income_tax?: number | null
          month?: number
          net_pay?: number | null
          overtime_pay?: number | null
          paid_at?: string | null
          pension_insurance?: number | null
          site_id?: string
          total_deduction?: number | null
          total_hours?: number | null
          total_pay?: number | null
          total_work_days?: number | null
          updated_at?: string
          weekly_holiday_pay?: number | null
          worker_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          created_at: string
          hourly_rate: number
          id: string
          id_number: string | null
          is_active: boolean
          is_owner: boolean
          name: string
          phone: string | null
          profile_id: string | null
          site_id: string
          updated_at: string
        }
        Insert: {
          bank_account?: string | null
          bank_name?: string | null
          created_at?: string
          hourly_rate: number
          id?: string
          id_number?: string | null
          is_active?: boolean
          is_owner?: boolean
          name: string
          phone?: string | null
          profile_id?: string | null
          site_id: string
          updated_at?: string
        }
        Update: {
          bank_account?: string | null
          bank_name?: string | null
          created_at?: string
          hourly_rate?: number
          id?: string
          id_number?: string | null
          is_active?: boolean
          is_owner?: boolean
          name?: string
          phone?: string | null
          profile_id?: string | null
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      workers_with_profile: {
        Row: {
          bank_account: string | null
          bank_name: string | null
          created_at: string
          hourly_rate: number
          id: string
          id_number: string | null
          is_active: boolean
          is_owner: boolean
          is_system_user: boolean
          name: string
          phone: string | null
          profile_email: string | null
          profile_full_name: string | null
          profile_id: string | null
          profile_role: string | null
          site_id: string
          updated_at: string
        }
      }
    }
    Functions: {
      is_user_worker_in_site: {
        Args: {
          user_id: string
          site_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
