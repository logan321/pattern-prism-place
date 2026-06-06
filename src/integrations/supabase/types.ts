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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string | null
          genero: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          genero?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          genero?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      colors: {
        Row: {
          created_at: string
          hex_code: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          hex_code: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          hex_code?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          plan: string | null
          primary_color: string | null
          slug: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          plan?: string | null
          primary_color?: string | null
          slug: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan?: string | null
          primary_color?: string | null
          slug?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      customizations: {
        Row: {
          config: Json
          created_at: string
          id: string
          preview_url: string | null
          product_id: string | null
          session_id: string | null
          status: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          preview_url?: string | null
          product_id?: string | null
          session_id?: string | null
          status?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          preview_url?: string | null
          product_id?: string | null
          session_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customizations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes: {
        Row: {
          created_at: string | null
          font_family: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          font_family: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          font_family?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      lojistas: {
        Row: {
          created_at: string | null
          facebook_pixel_id: string | null
          id: string
          logo_url: string | null
          nome: string
          slug: string
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          facebook_pixel_id?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          slug: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          facebook_pixel_id?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          slug?: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      modelos: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          glb_url: string
          id: string
          nome: string
          pecas: Json | null
          thumbnail_url: string | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string | null
          glb_url: string
          id?: string
          nome: string
          pecas?: Json | null
          thumbnail_url?: string | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string | null
          glb_url?: string
          id?: string
          nome?: string
          pecas?: Json | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modelos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          created_at: string | null
          dados_contato: Json
          id: string
          resumo_uniforme: Json
          status: string | null
          usuario_id: string | null
          whatsapp_link: string | null
        }
        Insert: {
          created_at?: string | null
          dados_contato: Json
          id?: string
          resumo_uniforme: Json
          status?: string | null
          usuario_id?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          created_at?: string | null
          dados_contato?: Json
          id?: string
          resumo_uniforme?: Json
          status?: string | null
          usuario_id?: string | null
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      patterns: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number | null
          created_at: string
          id: string
          is_3d: boolean | null
          model_url: string | null
          name: string
          sport_type: string
          thumbnail_url: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string
          id?: string
          is_3d?: boolean | null
          model_url?: string | null
          name: string
          sport_type: string
          thumbnail_url?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string
          id?: string
          is_3d?: boolean | null
          model_url?: string | null
          name?: string
          sport_type?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          id: string
          name?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          customization_id: string | null
          id: string
          notes: string | null
          quantity: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          customization_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          customization_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customization_id_fkey"
            columns: ["customization_id"]
            isOneToOne: false
            referencedRelation: "customizations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes: {
        Row: {
          configuracao: Json
          created_at: string | null
          id: string
          nome: string
          thumbnail_url: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          configuracao: Json
          created_at?: string | null
          id?: string
          nome: string
          thumbnail_url?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          configuracao?: Json
          created_at?: string | null
          id?: string
          nome?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      tipos_gola: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      tipos_manga: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tipos_punho: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string
          customization_id: string | null
          file_url: string
          id: string
          position: string
        }
        Insert: {
          created_at?: string
          customization_id?: string | null
          file_url: string
          id?: string
          position: string
        }
        Update: {
          created_at?: string
          customization_id?: string | null
          file_url?: string
          id?: string
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_customization_id_fkey"
            columns: ["customization_id"]
            isOneToOne: false
            referencedRelation: "customizations"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads_imagem: {
        Row: {
          created_at: string | null
          id: string
          tipo: string | null
          url: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tipo?: string | null
          url: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tipo?: string | null
          url?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          cidade: string | null
          created_at: string | null
          estado: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
