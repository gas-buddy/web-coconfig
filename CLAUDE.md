# @gasbuddy/web-coconfig

## What this is

A [coconfig](https://github.com/gas-buddy/coconfig) preset: the shared configuration baseline for **GasBuddy v23 web applications** — SSR React apps built on `@gasbuddy/gb-web-app` v3+ (webpack 5 client, babel-compiled server). It extends the service-shaped base preset (`@gasbuddy/coconfig`) with web-specific overrides.

It is NOT for Next.js apps and NOT for backend services (those use the base preset directly).

## How delivery works

Consuming apps do not depend on this package's runtime — they declare it and run the `coconfig` generator, which **materializes real config files into the app repo**:

```jsonc
// consumer package.json
"config": { "coconfig": "@gasbuddy/web-coconfig" },
"scripts": { "postinstall": "yarn dlx -p @gasbuddy/coconfig -p coconfig coconfig" }
```

Generated files REPLACE the app's copies on every run. Never hand-edit a generated file in a consumer; change it here (for everyone) or in the app's own `coconfig.ts` extension (app-local additions).

## What it emits (the contract)

- `tsconfig.json` — the web TS shape: **`noEmit: true`** (Babel owns all emit: webpack client, `babel --extensions '.js,.jsx,.ts,.tsx'` server; `tsc --noEmit` is the type GATE, never a build step), `allowJs` for incremental migration, `jsx: 'react-jsx'` (matches the babel automatic runtime), `module: CommonJS` + `moduleResolution: node` (babel-CJS output, extensionless imports), `isolatedModules` (single-file transforms — surfaces babel-unrepresentable TS like const enums at type-check time), include `src/tests/types/.storybook`.
- `types/web-globals.d.ts` — ambient modules for `*.css` (CSS-modules Record) and image assets. **Deliberately contains NO package shims**: a bare `declare module '@gasbuddy/react-components'` silently shadows that package's real published `.d.ts` (verified failure mode) — never add ambient declarations for packages that ship types.
- `.eslintrc.js` — extends `@gasbuddy/eslint-config-gasbuddy-web`, plus an override widening test/story lint exemptions to `**/*.{test,spec,stories}.{js,jsx,ts,tsx}` (the upstream shareable config's globs are JS-only and it has no source repo to patch).
- `.eslintignore` — base list plus `build-static/` and `storybook-static/` (web build outputs).
- Base-inherited files (`.npmignore`, `tsconfig.build.json`, `.prettierrc.js`, …) pass through unchanged.
- **Suppressed**: `jest.config.js` (web apps run two-tier jest — jsdom unit + node integration via `@gasbuddy/service-tester`'s `webJestConfig`; the base's single ts-jest config is wrong for them) and `next.config.js`.

## Ecosystem map

| Package | Role relative to this one |
|---|---|
| `@gasbuddy/coconfig` | Base preset this extends; also provides the generator runtime |
| `@gasbuddy/gb-web-app` v3+ | The web framework whose build model (babel-everywhere, unified `[jt]sx?` rule, CSS extraction) this tsconfig is shaped for |
| `@gasbuddy/babel-preset-gasbuddy` (scoped, v7+) | Compiles what this config type-checks — includes `@babel/preset-typescript` |
| `@gasbuddy/service` / `@gasbuddy/gb-services` | Server runtime; transpiler auto-detect boots TS/JS/mixed apps flaglessly |
| `@gasbuddy/service-tester` | `webJestConfig` provides the jest baseline this preset intentionally does not emit |
| `designer-web` | Reference/pilot app; its hand-rolled configs are the source of truth these emissions mirror — keep them in sync |

## Invariants

1. `noEmit` stays true — if tsc ever emits, server CSS-module imports crash at runtime (Babel's css-modules transform is what makes them legal).
2. `jsx: 'react-jsx'` must match the babel preset's automatic runtime; changing either side alone breaks compilation symmetry.
3. No ambient shims for typed packages (see above).
4. Emission changes are ecosystem-wide instantly on next consumer postinstall — validate against designer-web before publishing, and keep `__tests__/index.spec.ts`'s emitted-shape assertions current.

## Conventions

- Final version bumps are maintainer-stamped at release; pre-release bumps in feature PRs are acceptable.
- Repo toolchain: yarn 3, node 18, `yarn build` (tsc) / `yarn lint` / `yarn test` must pass; the test suite asserts the emitted contract above.
