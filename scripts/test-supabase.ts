import { config } from 'dotenv'

// Cargar variables de entorno
config()

console.log('🔍 Verificando configuración de Supabase...')
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurado' : '❌ No configurado')
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ No configurado')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurado' : '❌ No configurado')

if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://placeholder.supabase.co') {
  console.log('\n🚀 Probando conexión a Supabase...')
  
  import('../src/lib/posts').then(async ({ getAllPosts }) => {
    try {
      const posts = await getAllPosts()
      console.log(`✅ Conexión exitosa! Encontrados ${posts.length} posts`)
      posts.forEach(post => {
        console.log(`  - ${post.title} (${post.slug})`)
      })
    } catch (error) {
      console.error('❌ Error al conectar con Supabase:', error)
    }
  })
} else {
  console.log('\n⚠️  Supabase no está configurado correctamente')
  console.log('Por favor configura las variables en tu archivo .env')
}
