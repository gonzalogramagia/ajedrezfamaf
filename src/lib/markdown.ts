import { marked } from 'marked'
import { getImageUrl } from './storage'

export function parseMarkdown(markdown: string, postUrl?: string): string {
  // Configurar marked con opciones básicas
  marked.setOptions({
    breaks: true,
    gfm: true,
  })

  // Procesar el markdown
  let html = marked.parse(markdown) as string

  // Post-procesar enlaces para agregar target="_blank"
  html = html.replace(
    /<a href="([^"]+)"([^>]*)>([^<]+)<\/a>/g,
    (match, href, attrs, text) => {
      // No agregar target="_blank" a enlaces internos
      if (href.startsWith('/') || href.startsWith('#')) {
        return match
      }
      return `<a href="${href}"${attrs} target="_blank" rel="noopener noreferrer">${text}</a>`
    }
  )

  // Post-procesar imágenes para usar Supabase Storage
  html = html.replace(
    /<img src="([^"]+)"([^>]*)>/g,
    (match, src, attrs) => {
      // Validar que src sea una cadena válida
      if (!src || typeof src !== 'string') {
        return `<div style="color: red; font-style: italic;">[Imagen no válida]</div>`
      }
      
      // Si la imagen ya es una URL completa de Supabase, usarla directamente
      let imageUrl = src
      if (!src.startsWith('http')) {
        imageUrl = getImageUrl(src)
      }
      
      if (!imageUrl) {
        return `<div style="color: red; font-style: italic;">[Imagen no encontrada: ${src}]</div>`
      }
      
      const imgTag = `<img src="${imageUrl}"${attrs} style="max-width: 100%; height: auto; margin-top: 2rem !important; margin-bottom: 1.5rem !important; display: block; border-radius: 12px;" />`
      
      // Si hay una URL del post, envolver la imagen en un enlace
      if (postUrl) {
        return `<a href="${postUrl}" style="display: block; text-decoration: none;">${imgTag}</a>`
      }
      
      return imgTag
    }
  )

  return html
}
