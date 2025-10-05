import { config } from 'dotenv'

// Cargar variables de entorno
config()

console.log('🔍 Probando carga de posts en el contexto de Astro...')

import('../src/lib/posts').then(async ({ getAllPosts }) => {
  try {
    console.log('📡 Llamando a getAllPosts()...')
    const posts = await getAllPosts()
    console.log(`✅ Posts cargados: ${posts.length}`)
    
    if (posts.length > 0) {
      console.log('\n📝 Primeros 3 posts:')
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`  ${index + 1}. ${post.title}`)
        console.log(`     Slug: ${post.slug}`)
        console.log(`     Fecha: ${post.date}`)
        console.log(`     Versión: ${post.version}`)
      })
    } else {
      console.log('❌ No se encontraron posts')
    }
  } catch (error) {
    console.error('💥 Error:', error)
  }
})
