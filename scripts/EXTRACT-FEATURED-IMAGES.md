# Extracción de Imágenes de Portada

Este proceso extrae las imágenes de portada de los posts existentes y las mueve al campo `featured_image`.

## Pasos a seguir:

### 1. Agregar columna featured_image a la base de datos
Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Agregar columna featured_image a la tabla posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Comentario para documentar el campo
COMMENT ON COLUMN posts.featured_image IS 'URL o ruta de la imagen de portada del post';

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_posts_featured_image ON posts(featured_image) WHERE featured_image IS NOT NULL;
```

### 2. Ejecutar la extracción de imágenes
```bash
yarn extract-featured-images
```

Este script:
- ✅ Encuentra la primera imagen en cada post
- ✅ La mueve al campo `featured_image`
- ✅ Remueve esa imagen del contenido del post
- ✅ Actualiza el post en la base de datos

### 3. Verificar resultados
Después de ejecutar el script, verifica que:
- Los posts tengan el campo `featured_image` poblado
- El contenido ya no contenga la imagen de portada
- Las imágenes se muestren correctamente en la interfaz

## Notas importantes:

- ⚠️ **Haz backup de tu base de datos** antes de ejecutar
- 🔄 El proceso es **irreversible** (remueve las imágenes del contenido)
- 📝 Solo afecta a posts que tengan al menos una imagen
- 🖼️ Las imágenes deben estar en formato markdown: `![alt](src)`
