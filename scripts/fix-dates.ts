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

// Función para convertir fechas en español a formato YYYY-MM-DD
function parseSpanishDate(dateString: string): string | null {
  const monthMap: { [key: string]: number } = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
  }

  // Patrón para fechas como "29 de Marzo", "22 de Agosto"
  const match = dateString.match(/^(\d{1,2})\s+de\s+(\w+)$/i)
  
  if (!match) {
    console.warn(`No se pudo parsear la fecha: ${dateString}`)
    return null
  }

  const day = parseInt(match[1])
  const monthName = match[2].toLowerCase()
  const month = monthMap[monthName]

  if (month === undefined) {
    console.warn(`Mes no reconocido: ${monthName}`)
    return null
  }

  // Asumir año 2022 para los posts (basado en el contexto del proyecto)
  const year = 2022
  const date = new Date(year, month, day)
  
  if (isNaN(date.getTime())) {
    console.warn(`Fecha inválida: ${day}/${month + 1}/${year}`)
    return null
  }

  return date.toISOString().split('T')[0]
}

async function fixDates() {
  console.log('📅 Convirtiendo fechas en español a formato YYYY-MM-DD...')
  
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
      console.log(`\n📄 Post: "${post.title}"`)
      console.log(`   Fecha original: "${post.date}"`)
      
      const newDate = parseSpanishDate(post.date)
      
      if (newDate) {
        console.log(`   ✅ Nueva fecha: "${newDate}"`)
        
        // Actualizar el post con la nueva fecha
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            date: newDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`❌ Error actualizando post "${post.title}":`, updateError)
        } else {
          console.log(`✅ Post "${post.title}" actualizado correctamente`)
        }
      } else {
        console.log(`❌ No se pudo convertir la fecha para "${post.title}"`)
      }
    }
    
    console.log('\n🎉 Conversión de fechas completada!')
    
  } catch (error) {
    console.error('💥 Error durante la conversión:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDates()
}

export { fixDates }
