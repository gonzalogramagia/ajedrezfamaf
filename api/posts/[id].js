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
  console.log('Event:', JSON.stringify(event, null, 2))
  
  // Extraer el ID de la URL
  const urlPath = event.path || event.rawPath || ''
  const pathParts = urlPath.split('/')
  const id = pathParts[pathParts.length - 1]
  
  console.log('URL Path:', urlPath)
  console.log('Extracted ID:', id)
  
  if (!id) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Post ID is required' })
    }
  }

  try {
    // GET - Obtener post por ID
    if (event.httpMethod === 'GET') {
      console.log('GET request for post ID:', id)
      
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: error.message })
        }
      }

      console.log('Returning post data:', data)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      }
    }

    // PUT - Actualizar post
    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}')
      const { title, slug, date, version, content, featured_image } = body

      // Validar datos requeridos
      if (!title || !slug || !date || !version || !content) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields' })
        }
      }

      // Validar que el slug no sea una ruta reservada
      const reservedSlugs = ['torneos', 'admin', 'editor', 'colega']
      if (reservedSlugs.includes(slug.toLowerCase())) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Este slug está reservado para rutas del sistema' })
        }
      }

      // Verificar que el slug no exista en otro post
      const { data: existingPost } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existingPost) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Slug already exists' })
        }
      }

      // Actualizar el post
      const updateData = {
        title,
        slug,
        date,
        version,
        content,
        updated_at: new Date().toISOString()
      }
      
      // Solo agregar featured_image si se proporciona
      if (featured_image !== undefined) {
        updateData.featured_image = featured_image
      }
      
      const { data, error } = await supabaseAdmin
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      }
    }

    // DELETE - Eliminar post
    if (event.httpMethod === 'DELETE') {
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Post deleted successfully' })
      }
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('API Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
