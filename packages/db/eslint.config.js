import baseConfig from '@xystack/eslint-config/base'

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ['dist/**', 'migrations/**'],
  },
  ...baseConfig,
]
