import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  collectCoverageFrom: [
    'src/lib/power-users/**/*.{ts,tsx}',
    'src/types/power-users.ts',
    'src/components/power-users/**/*.{ts,tsx}',
    '!src/lib/power-users/**/*.test.ts',
    '!src/lib/power-users/**/__tests__/**',
    '!src/lib/power-users/**/__fixtures__/**',
    '!src/components/power-users/**/*.test.tsx',
    '!src/components/power-users/**/__tests__/**',
  ],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;

