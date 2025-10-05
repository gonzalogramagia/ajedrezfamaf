import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Cliente público (para el frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente con service role (para operaciones administrativas)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Tipos para la base de datos
export interface Post {
  id: string
  title: string
  date: string
  version: string
  content: string
  slug: string
  featured_image?: string
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  name: string
  description: string
  max_players: number
  system: string
  time_per_player: number
  time_increment: number
  start_date: string
  start_time: string
  location: string
  prizes: string
  cost: number
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  name: string
  email: string
  phone: string
  chess_level: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  tournament_id: string
  player_id: string
  discount_code?: string
  final_price: number
  payment_committed: boolean
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  tournament_id: string
  player1_id: string
  player2_id: string
  result: 'player1_wins' | 'player2_wins' | 'draw' | 'pending'
  moves?: string
  created_at: string
  updated_at: string
}
