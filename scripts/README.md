# Configuración de Supabase

## 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto llamado `ajedrezfamaf`
4. Espera a que se complete la configuración

## 2. Obtener credenciales

1. Ve a **Settings** > **API** en tu dashboard de Supabase
2. Copia los siguientes valores:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

## 3. Configurar variables de entorno

1. Copia `env.example` a `.env`
2. Agrega las credenciales de Supabase:

```bash
cp env.example .env
```

Luego edita `.env` con tus credenciales:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## 4. Configurar la base de datos

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido de `setup-database.sql`
3. Ejecuta el script para crear todas las tablas y políticas

## 5. Configurar Storage para imágenes

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido de `setup-storage.sql`
3. Ejecuta el script para crear el bucket de imágenes y políticas

## 6. Migrar posts existentes

Una vez configurada la base de datos, ejecuta:

```bash
yarn migrate-posts
```

Este script:
- Lee todos los archivos `.md` de `src/content/posts/`
- Los parsea y extrae el frontmatter
- Los inserta en la tabla `posts` de Supabase
- Actualiza posts existentes si ya están en la base de datos

## 7. Migrar imágenes existentes

Una vez configurado el storage, ejecuta:

```bash
yarn migrate-images
```

Este script:
- Lee todas las imágenes de la carpeta `public/`
- Las sube al bucket `post-images` de Supabase Storage
- Las hace accesibles públicamente

## Estructura de la base de datos

### Tablas creadas:

- **posts**: Almacena todos los posts del blog
- **chess_tournaments**: Información de torneos de ajedrez
- **chess_players**: Datos de jugadores registrados
- **chess_registrations**: Inscripciones a torneos
- **chess_matches**: Partidas de torneos

### Políticas RLS:

- **Lectura pública**: Todos pueden leer posts y torneos
- **Inscripciones públicas**: Cualquiera puede inscribirse a torneos
- **Creación de jugadores**: Cualquiera puede crear un perfil de jugador

## Próximos pasos

Una vez completada la migración:

1. Los posts se servirán desde Supabase en lugar de archivos markdown
2. Las imágenes se servirán desde Supabase Storage
3. Se pueden crear, editar y eliminar posts desde el panel de admin
4. Se pueden subir y gestionar imágenes desde el panel de admin
5. Se pueden gestionar torneos desde el panel de admin
6. Los usuarios pueden inscribirse a torneos desde la página pública
