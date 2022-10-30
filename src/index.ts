import config from '@gasbuddy/coconfig';

export default {
  ...config,
  'next.config.js': {
    config: {
      distDir: 'private',
    },
  },
};
