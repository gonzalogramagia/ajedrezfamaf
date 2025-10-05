import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Post } from './supabase'

// Cargar variables de entorno
config()

export async function getAllPosts(): Promise<Post[]> {
  // Verificar si Supabase está configurado
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('Supabase not configured, returning empty posts array')
    return []
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

  return data || []
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
