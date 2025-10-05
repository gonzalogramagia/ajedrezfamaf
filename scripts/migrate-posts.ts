import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config } from 'dotenv'

// Cargar variables de entorno
config()

// Definir tipo Post localmente
interface Post {
  id: string
  title: string
  date: string
  version: string
  content: string
  slug: string
  created_at: string
  updated_at: string
}

// Verificar variables de entorno
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.error('Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu archivo .env')
  process.exit(1)
}

// Crear cliente de Supabase
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface MarkdownPost {
  title: string
  date: string
  version: string
  content: string
  slug: string
}

async function migratePosts() {
  console.log('🚀 Iniciando migración de posts a Supabase...')
  console.log(`📍 URL: ${supabaseUrl}`)
  
  try {
    // Leer todos los archivos markdown
    const postsDir = path.join(process.cwd(), 'src/content/posts')
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'))
    
    console.log(`📁 Encontrados ${files.length} archivos markdown`)
    
    for (const file of files) {
      const filePath = path.join(postsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      
      // Parsear frontmatter y contenido
      const { data: frontmatter, content } = matter(fileContent)
      
      // Crear slug desde el nombre del archivo
      const slug = file.replace('.md', '')
      
      const postData: Omit<Post, 'id' | 'created_at' | 'updated_at'> = {
        title: frontmatter.title,
        date: frontmatter.date,
        version: frontmatter.version,
        content: content.trim(),
        slug: slug
      }
      
      console.log(`📝 Procesando: ${postData.title}`)
      
      // Verificar si el post ya existe
      const { data: existingPost } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .single()
      
      if (existingPost) {
        console.log(`⚠️  Post ya existe, actualizando: ${postData.title}`)
        
        // Actualizar post existente
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString()
          })
          .eq('slug', slug)
        
        if (updateError) {
          console.error(`❌ Error actualizando post ${postData.title}:`, updateError)
        } else {
          console.log(`✅ Post actualizado: ${postData.title}`)
        }
      } else {
        console.log(`➕ Creando nuevo post: ${postData.title}`)
        
        // Crear nuevo post
        const { error: insertError } = await supabaseAdmin
          .from('posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error(`❌ Error creando post ${postData.title}:`, insertError)
        } else {
          console.log(`✅ Post creado: ${postData.title}`)
        }
      }
    }
    
    console.log('🎉 Migración de posts completada!')
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error)
    process.exit(1)
  }
}

// Ejecutar migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePosts()
}

export { migratePosts }
