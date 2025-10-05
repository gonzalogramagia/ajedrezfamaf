export const prerender = false;

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase configuration missing')
}

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET({ params }) {
  const tournamentId = params.id

  if (!tournamentId) {
    return new Response(JSON.stringify({ error: 'Tournament ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('chess_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (error) {
      console.error('Error fetching tournament:', error)
      return new Response(JSON.stringify({ error: 'Tournament not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Tournament API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT({ params, request }) {
  const tournamentId = params.id

  if (!tournamentId) {
    return new Response(JSON.stringify({ error: 'Tournament ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const tournamentData = await request.json()
    
    // Validar datos requeridos
    const requiredFields = ['name', 'description', 'max_players', 'system', 'time_per_player', 'start_date', 'start_time', 'location', 'cost']
    for (const field of requiredFields) {
      if (!tournamentData[field]) {
        return new Response(JSON.stringify({ error: `Campo requerido: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('chess_tournaments')
      .update({
        name: tournamentData.name,
        description: tournamentData.description,
        max_players: parseInt(tournamentData.max_players),
        system: tournamentData.system,
        time_per_player: parseInt(tournamentData.time_per_player),
        start_date: tournamentData.start_date,
        start_time: tournamentData.start_time,
        location: tournamentData.location,
        prizes: tournamentData.prizes || '',
        cost: parseFloat(tournamentData.cost),
        status: tournamentData.status || 'upcoming',
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId)
      .select()

    if (error) {
      console.error('Error updating tournament:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'Tournament not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Tournament API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE({ params }) {
  const tournamentId = params.id

  if (!tournamentId) {
    return new Response(JSON.stringify({ error: 'Tournament ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { error } = await supabaseAdmin
      .from('chess_tournaments')
      .delete()
      .eq('id', tournamentId)

    if (error) {
      console.error('Error deleting tournament:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Tournament API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
