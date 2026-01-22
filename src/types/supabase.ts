export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            activity_logs: {
                Row: {
                    created_at: string
                    description: string
                    event_id: string
                    id: string
                    metadata: Json | null
                    related_id: string | null
                    type: string
                    volunteer_id: string | null
                }
                Insert: {
                    created_at?: string
                    description: string
                    event_id: string
                    id?: string
                    metadata?: Json | null
                    related_id?: string | null
                    type: string
                    volunteer_id?: string | null
                }
                Update: {
                    created_at?: string
                    description?: string
                    event_id?: string
                    id?: string
                    metadata?: Json | null
                    related_id?: string | null
                    type?: string
                    volunteer_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "activity_logs_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "activity_logs_volunteer_id_fkey"
                        columns: ["volunteer_id"]
                        isOneToOne: false
                        referencedRelation: "volunteers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            asset_assignments: {
                Row: {
                    asset_id: string
                    checked_in_at: string | null
                    checked_out_at: string
                    id: string
                    notes: string | null
                    volunteer_id: string
                }
                Insert: {
                    asset_id: string
                    checked_in_at?: string | null
                    checked_out_at?: string
                    id?: string
                    notes?: string | null
                    volunteer_id: string
                }
                Update: {
                    asset_id?: string
                    checked_in_at?: string | null
                    checked_out_at?: string
                    id?: string
                    notes?: string | null
                    volunteer_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "asset_assignments_asset_id_fkey"
                        columns: ["asset_id"]
                        isOneToOne: false
                        referencedRelation: "assets"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "asset_assignments_volunteer_id_fkey"
                        columns: ["volunteer_id"]
                        isOneToOne: false
                        referencedRelation: "volunteers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            assets: {
                Row: {
                    created_at: string
                    event_id: string
                    id: string
                    identifier: string | null
                    name: string
                    status: string | null
                    type: string
                }
                Insert: {
                    created_at?: string
                    event_id: string
                    id?: string
                    identifier?: string | null
                    name: string
                    status?: string | null
                    type: string
                }
                Update: {
                    created_at?: string
                    event_id?: string
                    id?: string
                    identifier?: string | null
                    name?: string
                    status?: string | null
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "assets_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            assignments: {
                Row: {
                    checked_in_at: string | null
                    checked_out_at: string | null
                    created_at: string
                    id: string
                    shift_id: string
                    volunteer_id: string
                }
                Insert: {
                    checked_in_at?: string | null
                    checked_out_at?: string | null
                    created_at?: string
                    id?: string
                    shift_id: string
                    volunteer_id: string
                }
                Update: {
                    checked_in_at?: string | null
                    checked_out_at?: string | null
                    created_at?: string
                    id?: string
                    shift_id?: string
                    volunteer_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "assignments_shift_id_fkey"
                        columns: ["shift_id"]
                        isOneToOne: false
                        referencedRelation: "shifts"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "assignments_volunteer_id_fkey"
                        columns: ["volunteer_id"]
                        isOneToOne: false
                        referencedRelation: "volunteers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            event_admins: {
                Row: {
                    created_at: string
                    event_id: string
                    id: string
                    role: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    event_id: string
                    id?: string
                    role?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    event_id?: string
                    id?: string
                    role?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "event_admins_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            event_invitations: {
                Row: {
                    created_at: string
                    email: string
                    event_id: string
                    expires_at: string
                    id: string
                    status: string
                    token: string
                }
                Insert: {
                    created_at?: string
                    email: string
                    event_id: string
                    expires_at?: string
                    id?: string
                    status?: string
                    token?: string
                }
                Update: {
                    created_at?: string
                    email?: string
                    event_id?: string
                    expires_at?: string
                    id?: string
                    status?: string
                    token?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "event_invitations_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            events: {
                Row: {
                    created_at: string
                    date: string | null
                    id: string
                    name: string
                    timezone: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    date?: string | null
                    id?: string
                    name: string
                    timezone?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string
                    date?: string | null
                    id?: string
                    name?: string
                    timezone?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    email: string | null
                    has_completed_tutorial: boolean | null
                    id: string
                    updated_at: string | null
                }
                Insert: {
                    email?: string | null
                    has_completed_tutorial?: boolean | null
                    id: string
                    updated_at?: string | null
                }
                Update: {
                    email?: string | null
                    has_completed_tutorial?: boolean | null
                    id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            shifts: {
                Row: {
                    allowed_groups: string[] | null
                    created_at: string
                    end_time: string
                    event_id: string
                    excluded_groups: string[] | null
                    id: string
                    name: string | null
                    required_groups: Json | null
                    start_time: string
                }
                Insert: {
                    allowed_groups?: string[] | null
                    created_at?: string
                    end_time: string
                    event_id: string
                    excluded_groups?: string[] | null
                    id?: string
                    name?: string | null
                    required_groups?: Json | null
                    start_time: string
                }
                Update: {
                    allowed_groups?: string[] | null
                    created_at?: string
                    end_time?: string
                    event_id?: string
                    excluded_groups?: string[] | null
                    id?: string
                    name?: string | null
                    required_groups?: Json | null
                    start_time?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "shifts_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            volunteer_groups: {
                Row: {
                    created_at: string
                    event_id: string
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string
                    event_id: string
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string
                    event_id?: string
                    id?: string
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "volunteer_groups_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            volunteers: {
                Row: {
                    created_at: string
                    email: string | null
                    event_id: string
                    external_id: string | null
                    group: string | null
                    id: string
                    max_hours: number | null
                    name: string
                    phone: string | null
                }
                Insert: {
                    created_at?: string
                    email?: string | null
                    event_id: string
                    external_id?: string | null
                    group?: string | null
                    id?: string
                    max_hours?: number | null
                    name: string
                    phone?: string | null
                }
                Update: {
                    created_at?: string
                    email?: string | null
                    event_id?: string
                    external_id?: string | null
                    group?: string | null
                    id?: string
                    max_hours?: number | null
                    name?: string
                    phone?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "volunteers_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_admin_emails: {
                Args: {
                    event_id_input: string
                }
                Returns: {
                    email: string
                    role: string
                }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (DatabaseWithoutInternals["public"]["Tables"] &
        DatabaseWithoutInternals["public"]["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])
    : PublicTableNameOrOptions extends keyof (DatabaseWithoutInternals["public"]["Tables"] &
        DatabaseWithoutInternals["public"]["Views"])
    ? PublicTableNameOrOptions
    : never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? (DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (DatabaseWithoutInternals["public"]["Tables"] &
        DatabaseWithoutInternals["public"]["Views"])
    ? (DatabaseWithoutInternals["public"]["Tables"] &
        DatabaseWithoutInternals["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof DatabaseWithoutInternals["public"]["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : PublicTableNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Tables"]
    ? PublicTableNameOrOptions
    : never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Tables"]
    ? DatabaseWithoutInternals["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof DatabaseWithoutInternals["public"]["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends PublicTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"]
    : PublicTableNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Tables"]
    ? PublicTableNameOrOptions
    : never,
> = PublicTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Tables"]
    ? DatabaseWithoutInternals["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof DatabaseWithoutInternals["public"]["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends PublicEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"]
    : PublicEnumNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Enums"]
    ? PublicEnumNameOrOptions
    : never,
> = PublicEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? DatabaseWithoutInternals[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof DatabaseWithoutInternals["public"]["Enums"]
    ? DatabaseWithoutInternals["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DatabaseWithoutInternals["public"]["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : PublicCompositeTypeNameOrOptions extends keyof DatabaseWithoutInternals["public"]["CompositeTypes"]
    ? PublicCompositeTypeNameOrOptions
    : never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DatabaseWithoutInternals["public"]["CompositeTypes"]
    ? DatabaseWithoutInternals["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
