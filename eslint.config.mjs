import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...coreWebVitals,
  {
    rules: {
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default config;
