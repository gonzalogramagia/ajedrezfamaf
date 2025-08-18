<template>
  <main class="min-h-screen relative">
    <div class="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <article v-if="post" class="prose prose-lg max-w-none">
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>
          <div class="flex items-center gap-4 text-gray-600 mb-6">
            <span>{{ post.date }}</span>
            <badge :label="post.version" />
          </div>
        </div>
        
        <ContentRenderer :value="post" class="document" />
        
        <Authors v-if="post.authors" :authors="post.authors" />
        
        <div class="mt-12 pt-8 border-t border-gray-200">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver al inicio
          </NuxtLink>
        </div>
      </article>
      
      <div v-else class="text-center py-12">
        <h1 class="text-2xl font-bold mb-4">Post no encontrado</h1>
        <p class="text-gray-600 mb-6">El post que buscas no existe.</p>
        <NuxtLink 
          to="/" 
          class="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          Volver al inicio
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup>
const route = useRoute();
const { slug } = route.params;

// Buscar el post que coincida con el slug (sin número ni punto)
const { data: post } = await useAsyncData(`post-${slug}`, async () => {
  const posts = await queryContent('/posts').find();
  
  // Encontrar el post que coincida con el slug
  return posts.find(post => {
    if (!post._file) return false;
    
    // Extraer el nombre del archivo sin extensión
    const fileName = post._file.split('/').pop().replace('.md', '');
    
    // Remover el número al inicio y el punto
    const postSlug = fileName.replace(/^\d+\./, '');
    
    return postSlug === slug;
  });
});

// Configurar SEO para el post
useHead({
  title: post.value ? `${post.value.title} - Ajedrez FAMAF` : 'Post no encontrado',
  meta: [
    { name: 'description', content: post.value ? post.value.title : 'Post no encontrado' },
  ],
});
</script>

<style>
.document {
  @apply max-w-none prose-h3:mb-4 prose-h3:text-base prose-h3:leading-6 prose-sm prose prose-pre:text-base prose-slate prose-a:font-semibold prose-a:text-primary hover:prose-a:text-sky-600;
}
</style>
