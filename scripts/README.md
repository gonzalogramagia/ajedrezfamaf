# Configuración de Supabase

Este proyecto utiliza Supabase como base de datos y storage para imágenes.

## Configuración actual

### Variables de entorno requeridas

Crea un archivo `.env` con las siguientes variables:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Contraseñas de administración
CHESS_ADMIN_PASSWORD=tu_password_admin
CHESS_EDITOR_PASSWORD=tu_password_editor
CHESS_COLEGA_PASSWORD=tu_password_colega
```

### Estructura de la base de datos

El proyecto utiliza las siguientes tablas en Supabase:

- **posts**: Almacena todos los posts del blog
- **chess_tournaments**: Información de torneos de ajedrez
- **chess_players**: Datos de jugadores registrados
- **chess_registrations**: Inscripciones a torneos
- **chess_matches**: Partidas de torneos

### Storage

- **post-images**: Bucket para almacenar imágenes de posts

## Funcionalidades

### Panel de administración (`/admin`)
- Gestión completa de posts (crear, editar, eliminar)
- Gestión completa de torneos (crear, editar, eliminar)
- Upload de imágenes a Supabase Storage

### Panel de editor (`/editor`)
- Gestión de posts (crear, editar)
- Upload de imágenes

### Panel de colega (`/colega`)
- Gestión de torneos (crear, editar)
- No puede eliminar torneos (solo admin)

### APIs disponibles

- `GET/POST /api/posts` - Gestión de posts
- `GET/PUT/DELETE /api/posts/[id]` - Operaciones individuales de posts
- `GET/POST /api/tournaments` - Gestión de torneos
- `GET/PUT/DELETE /api/tournaments/[id]` - Operaciones individuales de torneos
- `POST /api/upload-image` - Upload de imágenes

## Desarrollo

Para desarrollo local:

```bash
yarn dev
```

El proyecto está configurado con:
- Astro con modo `hybrid` para APIs
- Tailwind CSS para estilos
- Supabase para base de datos y storage