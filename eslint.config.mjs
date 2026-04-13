import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...coreWebVitals,
  {
    rules: {
      // App Router layouts can load fonts via <link> — this rule targets pages/ only
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default config;
