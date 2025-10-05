/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user?: {
      role: 'admin' | 'editor' | 'colega'
    }
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHESS_ADMIN_PASSWORD: string
      CHESS_EDITOR_PASSWORD: string
      CHESS_COLEGA_PASSWORD: string
      SUPABASE_URL: string
      SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
    }
  }
}