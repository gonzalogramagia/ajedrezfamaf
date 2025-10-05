import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { marked } from 'marked'

// Cargar variables de entorno
config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

// Cliente con service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Función para extraer la primera imagen de un post
function extractFeaturedImage(content: string): string | null {
  try {
    // Buscar imágenes en markdown: ![alt](src)
    const imageRegex = /!\[[^\]]*\]\(([^)]+)\)/g
    const match = imageRegex.exec(content)
    
    if (match && match[1]) {
      return match[1]
    }
    
    return null
  } catch (error) {
    console.error('Error extrayendo imagen:', error)
    return null
  }
}

// Función para remover la primera imagen del contenido
function removeFeaturedImage(content: string): string {
  try {
    // Remover la primera imagen encontrada
    const imageRegex = /!\[[^\]]*\]\([^)]+\)\s*\n?/g
    return content.replace(imageRegex, '', 1) // Solo remover la primera
  } catch (error) {
    console.error('Error removiendo imagen:', error)
    return content
  }
}

async function extractFeaturedImages() {
  console.log('🖼️  Extrayendo imágenes de portada de los posts...')
  
  try {
    // Obtener todos los posts
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')

    if (error) {
      console.error('❌ Error obteniendo posts:', error)
      return
    }

    console.log(`📝 Procesando ${posts.length} posts...`)

    for (const post of posts) {
      const featuredImage = extractFeaturedImage(post.content)
      
      if (featuredImage) {
        console.log(`✅ Post "${post.title}": imagen encontrada - ${featuredImage}`)
        
        // Remover la imagen del contenido
        const updatedContent = removeFeaturedImage(post.content)
        
        // Actualizar el post con la imagen de portada y contenido limpio
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            featured_image: featuredImage,
            content: updatedContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`❌ Error actualizando post "${post.title}":`, updateError)
        } else {
          console.log(`✅ Post "${post.title}" actualizado correctamente`)
        }
      } else {
        console.log(`⚠️  Post "${post.title}": no se encontró imagen`)
      }
    }
    
    console.log('🎉 Extracción de imágenes de portada completada!')
    
  } catch (error) {
    console.error('💥 Error durante la extracción:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  extractFeaturedImages()
}

export { extractFeaturedImages }
