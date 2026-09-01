# @gasbuddy/web-coconfig

![main CI](https://github.com/gas-buddy/web-coconfig/actions/workflows/npm_publish.yml/badge.svg)

[![npm version](https://badge.fury.io/js/@gasbuddy%2Fweb-coconfig.svg)](https://badge.fury.io/js/@gasbuddy%2Fweb-coconfig)

Default Node.js configuration files for GasBuddy web projects. Uses [coconfig](/gas-buddy/coconfig) to create a pile of configuration files.

## Next major (Unreleased): v23 web TypeScript baseline (webpack + babel SSR React apps)

As of the next major (Unreleased), this package targets the gb-services v23 web stack: server-rendered React apps built with webpack 5 + `@gasbuddy/gb-web-app` v3 and compiled through Babel (not `tsc` emit, and **not** Next.js -- Next apps should stay on `@gasbuddy/coconfig` directly, or a future Next-specific variant). `designer-web` is the reference/adoption target this config is designed to match.

On top of `@gasbuddy/coconfig`'s base, `@gasbuddy/web-coconfig`'s next major (Unreleased):

- Overrides `tsconfig.json` for a mixed JS/TS, no-emit setup: `noEmit: true` (Babel does the real build; `tsc --noEmit` is a type-check-only gate), `allowJs: true` / `checkJs: false`, `moduleResolution: 'node'`, `lib: ['ES2022', 'DOM', 'DOM.Iterable']`, `jsx: 'react-jsx'`, `resolveJsonModule`, `skipLibCheck`, `forceConsistentCasingInFileNames`, and `include`/`exclude` scoped to `src`, `tests`, `types`, `.storybook` (not the base's `__tests__`/`__mocks__`/`coconfig.ts`, which are this package's own dev conventions, not a web app's).
- Emits a new `types/web-globals.d.ts` with ambient module declarations for `*.css` (CSS Modules, `Record<string, string>` default export), `*.svg`/`*.png`/`*.gif`/`*.jpg` (asset imports, `string` default export), and an interim `@gasbuddy/react-components` + `@gasbuddy/react-components/reset.css` shim (marked `TODO(remove when @gasbuddy/react-components ships .d.ts)` -- tracked separately).
- Extends `.eslintrc.js` from `@gasbuddy/eslint-config-gasbuddy-web` (not the base's plain `gasbuddy`) and adds an override widening the test/story file glob to `**/*.{test,spec,stories}.{js,jsx,ts,tsx}`, since the upstream web eslint config's own override only covers `.js`/`.jsx`.
- Does **not** emit `next.config.js` (dropped -- this is the non-Next baseline).
- Does **not** emit `jest.config.js` (suppressed -- web apps own a two-tier Jest setup, jsdom unit tests + node integration tests via `@gasbuddy/service-tester`'s `webJestConfig`, which the single base `ts-jest` config would collide with).

## Using this package (opt-in)

Like the base `@gasbuddy/coconfig`, this only runs on `postinstall` if the consuming app wires it up. In your app's `package.json`:

```json
{
  "config": {
    "coconfig": "@gasbuddy/web-coconfig"
  },
  "scripts": {
    "postinstall": "yarn dlx -p @gasbuddy/web-coconfig -p coconfig coconfig"
  },
  "dependencies": {
    "@gasbuddy/web-coconfig": "^1.3.0"
  }
}
```

If you need to modify the emitted configuration further, create a `coconfig.js` (not `.ts` -- see the base coconfig README for why) in your app root that imports this package's default export, tweaks it, and re-exports the result; point `config.coconfig` at that file instead.
