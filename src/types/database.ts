export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      barbers: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string | null
          commission_rate: number
          active: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone?: string | null
          commission_rate?: number
          active?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string | null
          commission_rate?: number
          active?: boolean
          user_id?: string
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          name: string
          price: number
          duration_minutes: number
          active: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          price: number
          duration_minutes?: number
          active?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          price?: number
          duration_minutes?: number
          active?: boolean
          user_id?: string
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string | null
          email: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          phone?: string | null
          email?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          phone?: string | null
          email?: string | null
          user_id?: string
        }
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          client_id: string
          barber_id: string
          service_id: string
          start_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes: string | null
          commission_rate: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          client_id: string
          barber_id: string
          service_id: string
          start_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          commission_rate?: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          client_id?: string
          barber_id?: string
          service_id?: string
          start_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          notes?: string | null
          commission_rate?: number
          user_id?: string
        }
      }
      sales: {
        Row: {
          id: string
          created_at: string
          client_id: string | null
          barber_id: string
          total_amount: number
          payment_method: string
          commission_rate: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          client_id?: string | null
          barber_id: string
          total_amount: number
          payment_method: string
          commission_rate?: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          client_id?: string | null
          barber_id?: string
          total_amount?: number
          payment_method?: string
          commission_rate?: number
          user_id?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          service_id: string
          price_at_sale: number
        }
        Insert: {
          id?: string
          sale_id: string
          service_id: string
          price_at_sale: number
        }
        Update: {
          id?: string
          sale_id?: string
          service_id?: string
          price_at_sale?: number
        }
      }
      expenses: {
        Row: {
          id: string
          created_at: string
          description: string
          amount: number
          category: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          description: string
          amount: number
          category: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          description?: string
          amount?: number
          category?: string
          user_id?: string
        }
      }
    }
  }
}
