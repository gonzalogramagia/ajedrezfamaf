-- Agregar columna featured_image a la tabla posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Comentario para documentar el campo
COMMENT ON COLUMN posts.featured_image IS 'URL o ruta de la imagen de portada del post';

-- Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_posts_featured_image ON posts(featured_image) WHERE featured_image IS NOT NULL;
