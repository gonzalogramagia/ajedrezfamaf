import { config } from 'dotenv'

// Cargar variables de entorno
config()

import('../src/lib/markdown').then(async ({ parseMarkdown }) => {
  try {
    console.log('🧪 Probando procesamiento de Markdown...')
    
    const testMarkdown = `
# Test Post

Este es un [enlace a Lichess](https://lichess.org/tournament/YquCFKrW) y aquí hay una imagen:

![Torneo del 22 de Septembre](/torneo-22-sept.png)

Y otro [enlace interno](/torneo-22-ago).
    `.trim()
    
    console.log('📝 Markdown original:')
    console.log(testMarkdown)
    
    console.log('\n🔄 Procesando...')
    const html = parseMarkdown(testMarkdown)
    
    console.log('\n📄 HTML resultante:')
    console.log(html)
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
})
