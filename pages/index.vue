<template>
  <main class="min-h-screen relative">
    <hero />
    <instagram-floating-button />
    <section
      class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <post v-for="post in data" :content="post" />
    </section>
    
    <!-- Footer con Gonza -->
    <section class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <a
          class="inline-flex items-center text-yellow-500 hover:shadow-text transition-all text-lg"
          href="https://gonza.gr"
          target="_blank"
          rel="noopener noreferrer"
        >
          💻 🧉 Desarrollado por Gonza
        </a>
      </div>
    </section>
  </main>
</template>

<script setup>
import seoConfig from "../seoConfig/index";
useHead({
  title: seoConfig.title,
  meta: [
    { name: "description", content: seoConfig.description },
    { name: "og:title", content: seoConfig.og.title },
    { name: "og:description", content: seoConfig.og.description },
    { name: "og:image", content: seoConfig.og.image },
    { name: "og:url", content: seoConfig.og.url },
    { name: "twitter:title", content: seoConfig.og.title },
    { name: "twitter:description", content: seoConfig.og.description },
    { name: "twitter:image", content: seoConfig.og.image },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
const { data } = await useAsyncData("feed", () =>
  queryContent("/posts").find()
);
</script>

<style>
.hover\:shadow-text:hover {
  transform: scale(1.01);
}
</style>
