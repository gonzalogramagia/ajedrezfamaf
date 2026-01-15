import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Post } from './supabase'

// Cargar variables de entorno
config()

export async function getAllPosts(): Promise<Post[]> {
  // Verificar si Supabase está configurado
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning hardcoded test post')
    return [
      {
        id: 'hardcoded-1',
        title: 'Post de Prueba (Hardcoded)',
        date: new Date().toISOString(),
        version: '1.0.0',
        content: `
Este es un post de prueba **hardcodeado** para verificar la visualización sin base de datos.

![Imagen de prueba](/codeblocks.png)

Podemos probar:
- Listas
- **Negritas**
- [Enlaces](https://example.com)
`,
        slug: 'post-de-prueba-hardcoded',
        featured_image: '/codeblocks.png',
        excerpt: 'Este es un post de prueba hardcodeado para verificar la visualización sin base de datos.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'hardcoded-2',
        title: 'Torneo de Septiembre',
        date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        version: '0.9.0',
        content: `
¡Se viene el torneo de septiembre!

![Torneo](/torneo-22-sept.png)

No te pierdas la oportunidad de participar en nuestro próximo torneo.
- **Fecha:** 22 de Septiembre
- **Lugar:** FAMAF
- **Inscripción:** Gratuita

¡Te esperamos!
`,
        slug: 'torneo-septiembre',
        featured_image: '/torneo-22-sept.png',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ]
  }

  // Crear cliente específico para esta función
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data && data.length > 0 ? data : [
    {
      id: 'hardcoded-fallback',
      title: 'Post de Prueba (Fallback)',
      date: new Date().toISOString(),
      version: '2025',
      content: 'Este post aparece porque no hay posts en la base de datos.',
      excerpt: 'Este post aparece porque no hay posts en la base de datos.',
      slug: 'post-fallback',
      featured_image: '/codeblocks.png',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Verificar si Supabase está configurado
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning null')
    return null
  }

  // Crear cliente específico para esta función
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data
}

export async function createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<Post | null> {
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning null')
    return null
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...postData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post:', error)
    return null
  }

  return data
}

export async function updatePost(slug: string, postData: Partial<Post>): Promise<Post | null> {
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning null')
    return null
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('posts')
    .update({
      ...postData,
      updated_at: new Date().toISOString()
    })
    .eq('slug', slug)
    .select()
    .single()

  if (error) {
    console.error('Error updating post:', error)
    return null
  }

  return data
}

export async function deletePost(slug: string): Promise<boolean> {
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning false')
    return false
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug)

  if (error) {
    console.error('Error deleting post:', error)
    return false
  }

  return true
}
