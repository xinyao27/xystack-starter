import baseConfig, { restrictEnvAccess } from '@xystack/eslint-config/base'

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['.astro/**'],
  },
  ...baseConfig,
  ...restrictEnvAccess,
]
