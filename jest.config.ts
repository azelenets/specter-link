import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  watchman: false,
  moduleNameMapper: {
    '^@azelenets/aegis-design-system$': '<rootDir>/__mocks__/@azelenets/aegis-design-system.tsx',
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(config);
