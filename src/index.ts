import config from '@gasbuddy/coconfig';

Object.assign(config['tsconfig.json'].configuration.compilerOptions, {
  allowJs: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  noEmit: false,
  resolveJsonModule: true,
  jsx: 'preserve',
});

export default {
  ...config,
  'next.config.js': {
    config: {
      distDir: 'private',
    },
  },
};
