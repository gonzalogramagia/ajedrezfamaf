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

  // Extraer ID del post de la URL
  const pathSegments = event.path.split('/')
  const postId = pathSegments[pathSegments.length - 1]

  if (!postId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Post ID is required' })
    }
  }

  try {
    // GET - Obtener post por ID
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) {
        console.error('Error fetching post:', error)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Post not found' })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      }
    }

    // PUT - Actualizar post
    if (event.httpMethod === 'PUT') {
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
        .update({
          title: postData.title,
          content: postData.content,
          slug: postData.slug,
          date: postData.date,
          featured_image: postData.featured_image || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()

      if (error) {
        console.error('Error updating post:', error)
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
          body: JSON.stringify({ error: 'Post not found' })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data[0])
      }
    }

    // DELETE - Eliminar post
    if (event.httpMethod === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Error deleting post:', error)
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
    console.error('Posts API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}