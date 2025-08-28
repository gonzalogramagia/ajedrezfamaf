<template>
  <main class="min-h-screen relative">
    <instagram-floating-button />
    <!-- Header con logo y título -->
    <header class="py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div class="relative mx-auto max-w-[37.5rem] pt-18 sm:pt-20 text-center pb-8">
        <div class="sm:flex items-center justify-center space-x-4 sm:space-x-3">
          <div class="flex items-center justify-center">
            <NuxtLink to="/">
              <img
                loading="lazy"
                src="/ajedrezfamaf.jpg"
                alt="Ajedrez FAMAF"
                class="xs:mb-4 h-20 w-20 rounded-full"
              />
            </NuxtLink>
          </div>
          <NuxtLink to="/">
            <h1
              class="text-4xl font-extrabold tracking-tight text-slate-700 sm:text-5xl"
            >
              Ajedrez FAMAF
            </h1>
          </NuxtLink>
        </div>
      </div>
    </header>
    
    <div class="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-2 sm:py-8">
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
    
    <!-- Footer con Moovimiento -->
    <section class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <a
          class="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-lg"
          href="https://moovimiento.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⚡ Powered by Moovimiento
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
