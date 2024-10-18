/// <reference path="../.astro/types.d.ts" />

interface Env {
  DB: D1Database
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>

declare namespace App {
  interface Locals extends Runtime {
    user: import('@xystack/auth').User | null
    session: import('@xystack/auth').Session | null
  }
}
