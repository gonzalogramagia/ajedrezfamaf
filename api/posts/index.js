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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
    // GET - Obtener todos los posts
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
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

    // POST - Crear nuevo post
    if (event.httpMethod === 'POST') {
      const postData = JSON.parse(event.body)
      
      // Validar datos requeridos
      const requiredFields = ['title', 'content', 'slug', 'date']
      for (const field of requiredFields) {
        if (!postData[field]) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Campo requerido: ${field}` })
          }
        }
      }

      const { data, error } = await supabaseAdmin
        .from('posts')
        .insert([{
          title: postData.title,
          content: postData.content,
          slug: postData.slug,
          date: postData.date,
          featured_image: postData.featured_image || '',
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        console.error('Error creating post:', error)
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
    console.error('Posts API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}