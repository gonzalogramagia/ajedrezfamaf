import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Cargar variables de entorno
config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

// getStaticPaths no es necesario con output: 'server'

// GET - Obtener post por ID
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// PUT - Actualizar post
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { title, slug, date, version, content, featured_image } = body

    if (!id) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validar datos requeridos
    if (!title || !slug || !date || !version || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validar que el slug no sea una ruta reservada
    const reservedSlugs = ['torneos', 'admin', 'editor', 'colega']
    if (reservedSlugs.includes(slug.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Este slug está reservado para rutas del sistema' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verificar que el slug no exista en otro post
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingPost) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Actualizar el post
    const updateData: any = {
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
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('PUT error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// DELETE - Eliminar post
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({ error: 'Post ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ message: 'Post deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
