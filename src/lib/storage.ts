import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Cargar variables de entorno
config()

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key'

// Cliente de Supabase para storage
export const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey)

// Función para obtener URL pública de una imagen
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath || typeof imagePath !== 'string') return ''
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // Si es una ruta local, convertirla a URL de Supabase Storage
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  
  const { data } = supabaseStorage
    .storage
    .from('post-images')
    .getPublicUrl(cleanPath)
  
  return data.publicUrl
}

// Función para subir una imagen
export async function uploadImage(
  file: File, 
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabaseStorage.storage
      .from('post-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Error uploading image:', error)
      return { success: false, error: error.message }
    }

    const { data: urlData } = supabaseStorage.storage
      .from('post-images')
      .getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    console.error('Error uploading image:', error)
    return { success: false, error: 'Error uploading image' }
  }
}

// Función para eliminar una imagen
export async function deleteImage(imagePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    
    const { error } = await supabaseStorage.storage
      .from('post-images')
      .remove([cleanPath])

    if (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false, error: 'Error deleting image' }
  }
}

// Función para listar todas las imágenes
export async function listImages(): Promise<{ success: boolean; images?: any[]; error?: string }> {
  try {
    const { data, error } = await supabaseStorage.storage
      .from('post-images')
      .list()

    if (error) {
      console.error('Error listing images:', error)
      return { success: false, error: error.message }
    }

    return { success: true, images: data }
  } catch (error) {
    console.error('Error listing images:', error)
    return { success: false, error: 'Error listing images' }
  }
}
