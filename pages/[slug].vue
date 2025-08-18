<template>
  <main class="min-h-screen relative">
    <!-- Header con logo y título -->
    <header class="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 mt-8">
      <div class="flex items-center justify-center mb-8">
        <img src="/logo.svg" alt="Logo Ajedrez FAMAF" class="w-12 h-12 mr-4" />
        <h1 class="text-3xl font-bold text-primary">Ajedrez FAMAF</h1>
      </div>
    </header>
    
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
        
        <div class="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver al inicio
          </NuxtLink>
          
          <button 
            @click="copyUrl"
            class="inline-flex items-center text-primary hover:text-primary/80 transition-colors border border-sky-400 px-4 py-2 rounded-lg"
            :class="{ 'text-green-600 border-green-400': copied }"
          >
            <svg v-if="!copied" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ copied ? '¡Copiado!' : 'Copiar URL' }}
          </button>
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
    
    <!-- Footer con Instagram -->
    <section class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <a
          class="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-lg"
          href="https://www.instagram.com/ajedrezfamaf"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          @ajedrezfamaf
        </a>
      </div>
    </section>
  </main>
</template>

<script setup>
const route = useRoute();
const { slug } = route.params;
const copied = ref(false);

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

// Función para copiar la URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar URL:', err);
  }
};

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
