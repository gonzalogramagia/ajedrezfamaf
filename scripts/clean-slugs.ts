import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

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

// Función para limpiar slug
function cleanSlug(slug: string): string {
  // Remover número inicial y punto (ej: "1.torneo-22-ago" -> "torneo-22-ago")
  return slug.replace(/^\d+\./, '')
}

async function cleanSlugs() {
  console.log('🧹 Limpiando slugs de los posts...')
  
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
      const originalSlug = post.slug
      const cleanSlugValue = cleanSlug(originalSlug)
      
      if (originalSlug !== cleanSlugValue) {
        console.log(`✅ Post "${post.title}": "${originalSlug}" -> "${cleanSlugValue}"`)
        
        // Actualizar el post con el slug limpio
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            slug: cleanSlugValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`❌ Error actualizando post "${post.title}":`, updateError)
        } else {
          console.log(`✅ Post "${post.title}" actualizado correctamente`)
        }
      } else {
        console.log(`⚠️  Post "${post.title}": slug ya limpio - "${originalSlug}"`)
      }
    }
    
    console.log('🎉 Limpieza de slugs completada!')
    
  } catch (error) {
    console.error('💥 Error durante la limpieza:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanSlugs()
}

export { cleanSlugs }
