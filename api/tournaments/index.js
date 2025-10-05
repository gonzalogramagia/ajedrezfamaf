const { createClient } = require('@supabase/supabase-js')

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
  console.log('Tournaments API request:', event.httpMethod, event.path)
  
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    // GET - Obtener todos los torneos
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('chess_tournaments')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching tournaments:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      }
    }

    // POST - Crear nuevo torneo
    if (event.httpMethod === 'POST') {
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
        .insert([{
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
          status: 'upcoming',
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        console.error('Error creating tournament:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: error.message })
        }
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(data[0])
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Tournaments API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
