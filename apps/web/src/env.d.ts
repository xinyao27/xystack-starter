/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime

declare namespace App {
  interface Locals extends Runtime {
    user: User | null
    session: Session | null
  }
}
