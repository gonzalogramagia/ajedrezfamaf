const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  // Extraer ID del torneo de la URL
  const pathSegments = event.path.split('/')
  const tournamentId = pathSegments[pathSegments.length - 1]

  if (!tournamentId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Tournament ID is required' })
    }
  }

  try {
    // GET - Obtener torneo específico
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('chess_tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()

      if (error) {
        console.error('Error fetching tournament:', error)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Tournament not found' })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      }
    }

    // PUT - Actualizar torneo
    if (event.httpMethod === 'PUT') {
      const tournamentData = JSON.parse(event.body)
      
      // Validar datos requeridos
      const requiredFields = ['name', 'description', 'max_players', 'system', 'time_per_player', 'start_date', 'start_time', 'location', 'cost']
      for (const field of requiredFields) {
        if (!tournamentData[field]) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Campo requerido: ${field}` })
          }
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
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        }
      }

      if (!data || data.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Tournament not found' })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data[0])
      }
    }

    // DELETE - Eliminar torneo
    if (event.httpMethod === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('chess_tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) {
        console.error('Error deleting tournament:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Tournament API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}