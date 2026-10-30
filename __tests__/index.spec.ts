import config, { nextConfig } from '../src';

test('index', () => {
  expect(config).toBeTruthy();
});

test('tsconfig overrides are applied for the v23 web (webpack+babel SSR) baseline', () => {
  const tsconfig = config['tsconfig.json'].configuration as any;
  expect(tsconfig.include).toEqual(['src', 'tests', 'types', '.storybook']);
  expect(tsconfig.exclude).toEqual(['node_modules', 'build', 'build-static']);
  expect(tsconfig.compilerOptions).toMatchObject({
    moduleResolution: 'node',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    jsx: 'react-jsx',
    allowJs: true,
    checkJs: false,
    noEmit: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  });
});

test('next.config.js is not emitted (this is the webpack+babel SSR baseline, not Next.js)', () => {
  expect(config).not.toHaveProperty(['next.config.js']);
});

test('the base single ts-jest jest.config.js is suppressed (web apps own two-tier configs)', () => {
  expect(config).not.toHaveProperty(['jest.config.js']);
});

test('types/web-globals.d.ts is emitted with the expected ambient declarations', () => {
  const entry = config['types/web-globals.d.ts'] as any;
  expect(entry.content).toContain("declare module '*.css'");
  expect(entry.content).toContain("declare module '*.svg'");
  expect(entry.content).toContain("declare module '*.png'");
  expect(entry.content).toContain("declare module '*.gif'");
  expect(entry.content).toContain("declare module '*.jpg'");
  // No package shims: @gasbuddy/react-components ships real .d.ts (9.1+), and a bare
  // ambient declare-module silently shadows real published types.
  expect(entry.content).not.toContain('@gasbuddy/react-components');
});

test('.eslintrc.js extends the web config and widens the test/story override globs', () => {
  const eslintRc = config['.eslintrc.js'].configuration as any;
  expect(eslintRc.extends).toBe('@gasbuddy/eslint-config-gasbuddy-web');
  const widenedOverride = eslintRc.overrides.find(
    (o: any) => o.files?.[0] === '**/*.{test,spec,stories}.{js,jsx,ts,tsx}',
  );
  expect(widenedOverride).toBeTruthy();
  expect(widenedOverride.rules['max-len']).toBe('off');
});

test('.eslintignore gains web build outputs on top of the base list', () => {
  const entry = (config as any)['.eslintignore'] as string;
  expect(entry).toContain('build-static/');
  expect(entry).toContain('storybook-static/');
  expect(entry).toContain('build/');
});

describe('nextConfig (Next.js variant)', () => {
  test('emits next.config.js with the private distDir', () => {
    expect(nextConfig).toHaveProperty(['next.config.js']);
    expect((nextConfig as any)['next.config.js'].configuration).toEqual({ distDir: 'private' });
  });

  test('keeps the base ts-jest jest.config.js (Next apps run gb-jest, not the two-tier web setup)', () => {
    expect(nextConfig).toHaveProperty(['jest.config.js']);
  });

  test('tsc still emits and leaves JSX for Next to transform', () => {
    const { compilerOptions } = (nextConfig as any)['tsconfig.json'].configuration;
    expect(compilerOptions).toMatchObject({
      jsx: 'preserve',
      noEmit: false,
      module: 'CommonJS',
      resolveJsonModule: true,
    });
  });

  test('keeps the base service-shaped include rather than the React one', () => {
    const tsconfig = (nextConfig as any)['tsconfig.json'].configuration;
    expect(tsconfig.include).toContain('__tests__/**/*');
    expect(tsconfig.include).not.toEqual(['src', 'tests', 'types', '.storybook']);
  });

  test('does not emit types/web-globals.d.ts (Next covers it via next-env.d.ts)', () => {
    expect(nextConfig).not.toHaveProperty(['types/web-globals.d.ts']);
    expect(config).toHaveProperty(['types/web-globals.d.ts']);
  });

  // Both variants edit tsconfig, and the base config object they start from is a
  // shared module-level singleton -- so this guards against one variant's
  // Object.assign leaking into the other.
  test('does not pollute the React variant', () => {
    const react = (config as any)['tsconfig.json'].configuration.compilerOptions;
    const next = (nextConfig as any)['tsconfig.json'].configuration.compilerOptions;
    expect(react.jsx).toBe('react-jsx');
    expect(next.jsx).toBe('preserve');
    expect(react.noEmit).toBe(true);
    expect(next.noEmit).toBe(false);
    expect(config).not.toHaveProperty(['next.config.js']);
  });
});
