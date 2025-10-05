-- Crear bucket para imágenes de posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Post images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');

-- Política para permitir subida de imágenes (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir actualización de imágenes (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can update post images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir eliminación de imágenes (solo para usuarios autenticados)
CREATE POLICY "Authenticated users can delete post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);
