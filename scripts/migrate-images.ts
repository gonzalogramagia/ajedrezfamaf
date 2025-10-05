import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno
config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

// Cliente con service role para operaciones administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateImages() {
  console.log('🚀 Iniciando migración de imágenes a Supabase Storage...')
  
  try {
    // Leer todas las imágenes de la carpeta public
    const publicDir = path.join(process.cwd(), 'public')
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    
    if (!fs.existsSync(publicDir)) {
      console.log('📁 No se encontró la carpeta public')
      return
    }
    
    const files = fs.readdirSync(publicDir)
      .filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)))
    
    console.log(`📁 Encontradas ${files.length} imágenes`)
    
    for (const file of files) {
      const filePath = path.join(publicDir, file)
      const fileBuffer = fs.readFileSync(filePath)
      
      // Determinar el tipo MIME basado en la extensión
      const ext = path.extname(file).toLowerCase()
      let contentType = 'image/png' // default
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg'
          break
        case '.png':
          contentType = 'image/png'
          break
        case '.gif':
          contentType = 'image/gif'
          break
        case '.webp':
          contentType = 'image/webp'
          break
      }
      
      console.log(`📤 Subiendo: ${file} (${contentType})`)
      
      const { data, error } = await supabaseAdmin.storage
        .from('post-images')
        .upload(file, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType
        })
      
      if (error) {
        console.error(`❌ Error subiendo ${file}:`, error)
      } else {
        console.log(`✅ Imagen subida: ${file}`)
      }
    }
    
    console.log('🎉 Migración de imágenes completada!')
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error)
    process.exit(1)
  }
}

// Ejecutar migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateImages()
}

export { migrateImages }
