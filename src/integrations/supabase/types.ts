export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      destination_questions: {
        Row: {
          answer: number;
          created_at: string;
          destination_id: string | null;
          destination_slug: string;
          explanation: string;
          id: string;
          options: Json;
          question: string;
          sort_order: number;
        };
        Insert: {
          answer: number;
          created_at?: string;
          destination_id?: string | null;
          destination_slug: string;
          explanation?: string;
          id?: string;
          options: Json;
          question: string;
          sort_order?: number;
        };
        Update: {
          answer?: number;
          created_at?: string;
          destination_id?: string | null;
          destination_slug?: string;
          explanation?: string;
          id?: string;
          options?: Json;
          question?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "destination_questions_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      destinations: {
        Row: {
          address: string;
          category: string;
          created_at: string;
          description: string;
          featured: boolean;
          gallery_urls: Json;
          history: string;
          id: string;
          image_path: string | null;
          latitude: number | null;
          longitude: number | null;
          name: string;
          province: string;
          significance: string;
          slug: string;
          sources: string;
          updated_at: string;
        };
        Insert: {
          address?: string;
          category: string;
          created_at?: string;
          description?: string;
          featured?: boolean;
          gallery_urls?: Json;
          history?: string;
          id?: string;
          image_path?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          province: string;
          significance?: string;
          slug: string;
          sources?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          category?: string;
          created_at?: string;
          description?: string;
          featured?: boolean;
          gallery_urls?: Json;
          history?: string;
          id?: string;
          image_path?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          province?: string;
          significance?: string;
          slug?: string;
          sources?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      panorama_artworks: {
        Row: {
          artist: string;
          conservation_notes: string;
          created_at: string;
          description: string;
          dimensions: string;
          display_order: number;
          filipino_title: string;
          historical_period: string;
          historical_significance: string;
          hotspot_id: string | null;
          id: string;
          image_path: string | null;
          medium: string;
          scene_id: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          artist?: string;
          conservation_notes?: string;
          created_at?: string;
          description?: string;
          dimensions?: string;
          display_order?: number;
          filipino_title?: string;
          historical_period?: string;
          historical_significance?: string;
          hotspot_id?: string | null;
          id?: string;
          image_path?: string | null;
          medium?: string;
          scene_id: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          artist?: string;
          conservation_notes?: string;
          created_at?: string;
          description?: string;
          dimensions?: string;
          display_order?: number;
          filipino_title?: string;
          historical_period?: string;
          historical_significance?: string;
          hotspot_id?: string | null;
          id?: string;
          image_path?: string | null;
          medium?: string;
          scene_id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "panorama_artworks_hotspot_id_fkey";
            columns: ["hotspot_id"];
            isOneToOne: true;
            referencedRelation: "panorama_hotspots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "panorama_artworks_scene_id_fkey";
            columns: ["scene_id"];
            isOneToOne: false;
            referencedRelation: "panorama_scenes";
            referencedColumns: ["id"];
          },
        ];
      };
      panorama_hotspots: {
        Row: {
          bearing: number;
          created_at: string;
          display_order: number;
          hotspot_type: string;
          id: string;
          metadata: Json;
          pitch: number;
          scene_id: string;
          subtitle: string;
          target_scene_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          bearing?: number;
          created_at?: string;
          display_order?: number;
          hotspot_type?: string;
          id?: string;
          metadata?: Json;
          pitch?: number;
          scene_id: string;
          subtitle?: string;
          target_scene_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          bearing?: number;
          created_at?: string;
          display_order?: number;
          hotspot_type?: string;
          id?: string;
          metadata?: Json;
          pitch?: number;
          scene_id?: string;
          subtitle?: string;
          target_scene_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "panorama_hotspots_scene_id_fkey";
            columns: ["scene_id"];
            isOneToOne: false;
            referencedRelation: "panorama_scenes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "panorama_hotspots_target_scene_id_fkey";
            columns: ["target_scene_id"];
            isOneToOne: false;
            referencedRelation: "panorama_scenes";
            referencedColumns: ["id"];
          },
        ];
      };
      panorama_scenes: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          initial_view: Json;
          location_label: string;
          original_image_path: string;
          preview_image_path: string | null;
          status: string;
          tile_configuration: Json;
          title: string;
          tour_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          initial_view?: Json;
          location_label?: string;
          original_image_path: string;
          preview_image_path?: string | null;
          status?: string;
          tile_configuration?: Json;
          title: string;
          tour_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          initial_view?: Json;
          location_label?: string;
          original_image_path?: string;
          preview_image_path?: string | null;
          status?: string;
          tile_configuration?: Json;
          title?: string;
          tour_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "panorama_scenes_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "panorama_tours";
            referencedColumns: ["id"];
          },
        ];
      };
      panorama_tours: {
        Row: {
          cover_image_path: string | null;
          created_at: string;
          created_by: string;
          description: string;
          destination_id: string | null;
          destination_slug: string;
          id: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_image_path?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string;
          destination_id?: string | null;
          destination_slug: string;
          id?: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_image_path?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string;
          destination_id?: string | null;
          destination_slug?: string;
          id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "panorama_tours_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "panorama_tours_destination_slug_fkey";
            columns: ["destination_slug"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["slug"];
          },
        ];
      };
      sulyap_admins: {
        Row: {
          created_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      visitor_progress: {
        Row: {
          attempts: number;
          best: number;
          destination_id: string | null;
          destination_slug: string;
          last: number;
          total: number;
          toured: boolean;
          updated_at: string;
          visitor_id: string;
        };
        Insert: {
          attempts?: number;
          best?: number;
          destination_id?: string | null;
          destination_slug: string;
          last?: number;
          total?: number;
          toured?: boolean;
          updated_at?: string;
          visitor_id: string;
        };
        Update: {
          attempts?: number;
          best?: number;
          destination_id?: string | null;
          destination_slug?: string;
          last?: number;
          total?: number;
          toured?: boolean;
          updated_at?: string;
          visitor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visitor_progress_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_sulyap_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
