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

async function checkDates() {
  console.log('📅 Verificando fechas en la base de datos...')
  
  try {
    // Obtener todos los posts
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('id, title, date, created_at')

    if (error) {
      console.error('❌ Error obteniendo posts:', error)
      return
    }

    console.log(`📝 Revisando ${posts.length} posts...`)

    for (const post of posts) {
      console.log(`\n📄 Post: "${post.title}"`)
      console.log(`   ID: ${post.id}`)
      console.log(`   Date field: "${post.date}" (${typeof post.date})`)
      console.log(`   Created at: ${post.created_at}`)
      
      // Verificar si la fecha es válida
      if (typeof post.date === 'string') {
        const dateObj = new Date(post.date)
        if (isNaN(dateObj.getTime())) {
          console.log(`   ❌ Fecha inválida: "${post.date}"`)
        } else {
          console.log(`   ✅ Fecha válida: ${dateObj.toISOString().split('T')[0]}`)
        }
      } else {
        console.log(`   ⚠️  Fecha no es string: ${typeof post.date}`)
      }
    }
    
    console.log('\n🎉 Verificación completada!')
    
  } catch (error) {
    console.error('💥 Error durante la verificación:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDates()
}

export { checkDates }
