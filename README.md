# xystack-starter

## About

It uses [Turborepo](https://turborepo.org) and contains:

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  └─ web
      ├─ NextJS 15
      ├─ React 19
      ├─ Tailwind CSS
      └─ E2E Typesafe API Server & Client
packages
  ├─ api
  |   └─ Hono router definition
  ├─ auth
  |   └─ Authentication using lucia.
  ├─ db
  |   └─ Typesafe db calls using Drizzle & Cloudflare D1
  └─ ui
      └─ Start of a UI package for the webapp using shadcn-ui
tooling
  ├─ eslint
  |   └─ shared, fine-grained, eslint presets
  ├─ prettier
  |   └─ shared prettier configuration
  ├─ tailwind
  |   └─ shared tailwind configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```
