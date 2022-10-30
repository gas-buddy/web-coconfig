import config from '@gasbuddy/coconfig';

Object.assign(config['tsconfig.json'].configuration.compilerOptions, {
  allowJs: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  noEmit: false,
  resolveJsonModule: true,
  jsx: 'preserve',
});

const eslint = config['.eslintrc.js'].configuration as any;

export default {
  ...config,
  'next.config.js': {
    configuration: {
      distDir: 'private',
    },
  },
  '.eslintrc.js': {
    configuration: {
      ...eslint,
      rules: {
        ...eslint.rules,
        'import/extensions': [
          'off',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
      },
    },
  },
};
