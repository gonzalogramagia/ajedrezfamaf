import { config } from 'dotenv'

// Cargar variables de entorno
config()

import('../src/lib/posts').then(async ({ getAllPosts }) => {
  try {
    const posts = await getAllPosts()
    console.log(`📝 Total posts: ${posts.length}`)
    
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`)
      console.log(`   Slug: "${post.slug}"`)
      console.log(`   Slug type: ${typeof post.slug}`)
      console.log(`   Slug length: ${post.slug?.length || 0}`)
    })
  } catch (error) {
    console.error('💥 Error:', error)
  }
})
