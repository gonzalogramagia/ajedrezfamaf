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

async function restorePost() {
  console.log('🔄 Restaurando contenido del post original...')
  
  const postId = 'acf4ddbc-5e2c-4b59-bedf-1536061b6361'
  const originalContent = `El sobrino de Gastón Moisset sigue imparable y [gana por segunda vez consecutiva](https://lichess.org/tournament/YquCFKrW) otro de los torneos amistosos que venimos realizando cada mes, esta vez festejando el Equinoccio 🌞

En segundo lugar quedó Nehuen Merhe, otro gran ajedrecista de nuestra facultad, quien volverá a representarnos en un torneo por equipos de Ajedrez Pensado dentro de unos dias 🤝

Los esperamos en el próximo torneo, el cual será presencial. Pronto más novedades!

![Torneo del 22 de Septembre](/torneo-22-sept.png)`

  const { data, error } = await supabaseAdmin
    .from('posts')
    .update({
      title: 'Hernán Moisset gana el III Torneo Amistoso Blitz',
      slug: 'torneo-22-sept',
      date: '2022-09-22',
      version: 'NOTICIA',
      content: originalContent,
      featured_image: '/torneo-22-sept.png',
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error restaurando post:', error)
    return
  }

  console.log('✅ Post restaurado correctamente:')
  console.log(`   Título: ${data.title}`)
  console.log(`   Slug: ${data.slug}`)
  console.log(`   Fecha: ${data.date}`)
  console.log(`   Versión: ${data.version}`)
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  restorePost()
}

export { restorePost }
